process.env.NODE_ENV = 'development';

// Load environment variables from .env file. Suppress warnings using silent
// if this file is missing. dotenv will never modify any environment variables
// that have already been set.
// https://github.com/motdotla/dotenv
require('dotenv').config({silent: true});

var fs = require('fs');

var chalk = require('chalk');
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var historyApiFallback = require('connect-history-api-fallback');
var httpProxyMiddleware = require('http-proxy-middleware');
var detect = require('detect-port');
var clearConsole = require('react-dev-utils/clearConsole');
var checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
var formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
var getProcessForPort = require('react-dev-utils/getProcessForPort');
var openBrowser = require('react-dev-utils/openBrowser');
var prompt = require('react-dev-utils/prompt');
var pathExists = require('path-exists');
var config = require('../config/webpack.config.dev');
var paths = require('../config/paths');
var constants = require('../config/constants');

var useYarn = pathExists.sync(paths.yarnLockFile);
var cli = useYarn ? 'yarn' : 'npm';
var isInteractive = process.stdout.isTTY;

/**** server  */
var express = require("express");
var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
var multer = require('multer');
var upload = multer();

var app = express();
var routes = require('./routes/index');
var api = require('./routes/api');
var admin = require('./routes/admin');

///////////////////////////////////////

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(upload.array());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE");
  res.header("Access-Control-Expose-Headers", "Authorization");
  next();
});


app.use('/', routes);
app.use('/api', api);
app.use('/admin', admin);

app.listen(constants.PORT);

app.get('/', function(req, res) {
  console.log("server running 5000");
  res.send("server is running");
});

// http.createServer(app).listen(constants.PORT);
var DEFAULT_PORT = process.env.PORT || constants.FPORT;
var compiler;
var handleCompile;

var isSmokeTest = process.argv.some(arg => arg.indexOf('--smoke-test') > -1);
if (isSmokeTest) {
  handleCompile = function (err, stats) {
    if (err || stats.hasErrors() || stats.hasWarnings()) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  };
}

function setupCompiler(host, port, protocol) {
  compiler = webpack(config, handleCompile);

  compiler.plugin('invalid', function() {
    if (isInteractive) {
      clearConsole();
    }
    console.log('Compiling...');
  });

  var isFirstCompile = true;

  compiler.plugin('done', function(stats) {
    if (isInteractive) {
      clearConsole();
    }

    var messages = formatWebpackMessages(stats.toJson({}, true));
    var isSuccessful = !messages.errors.length && !messages.warnings.length;
    var showInstructions = isSuccessful && (isInteractive || isFirstCompile);

    if (isSuccessful) {
      console.log(chalk.green('Compiled successfully!'));
    }

    if (showInstructions) {
      console.log();
      console.log('The app is running at:');
      console.log();
      console.log('  ' + chalk.cyan(protocol + '://' + host + ':' + port + '/'));
      console.log();
      console.log('Note that the development build is not optimized.');
      console.log('To create a production build, use ' + chalk.cyan(cli + ' run build') + '.');
      console.log();
      isFirstCompile = false;
    }

    if (messages.errors.length) {
      console.log(chalk.red('Failed to compile.'));
      console.log();
      messages.errors.forEach(message => {
        console.log(message);
        console.log();
      });
      return;
    }

    if (messages.warnings.length) {
      console.log(chalk.yellow('Compiled with warnings.'));
      console.log();
      messages.warnings.forEach(message => {
        console.log(message);
        console.log();
      });
    }
  });
}

function onProxyError(proxy) {
  return function(err, req, res){
    var host = req.headers && req.headers.host;
    console.log(
      chalk.red('Proxy error:') + ' Could not proxy request ' + chalk.cyan(req.url) +
      ' from ' + chalk.cyan(host) + ' to ' + chalk.cyan(proxy) + '.'
    );
    console.log(
      'See https://nodejs.org/api/errors.html#errors_common_system_errors for more information (' +
      chalk.cyan(err.code) + ').'
    );
    console.log();

    if (res.writeHead && !res.headersSent) {
        res.writeHead(500);
    }
    res.end('Proxy error: Could not proxy request ' + req.url + ' from ' +
      host + ' to ' + proxy + ' (' + err.code + ').'
    );
  }
}

function addMiddleware(devServer) {
  var proxy = require(paths.appPackageJson).proxy;
  devServer.use(historyApiFallback({
    disableDotRule: true,
    htmlAcceptHeaders: proxy ?
      ['text/html'] :
      ['text/html', '*/*']
  }));
  if (proxy) {
    if (typeof proxy !== 'string') {
      console.log(chalk.red('When specified, "proxy" in package.json must be a string.'));
      console.log(chalk.red('Instead, the type of "proxy" was "' + typeof proxy + '".'));
      console.log(chalk.red('Either remove "proxy" from package.json, or make it a string.'));
      process.exit(1);
    }

    var mayProxy = /^(?!\/(index\.html$|.*\.hot-update\.json$|sockjs-node\/)).*$/;

    var hpm = httpProxyMiddleware(pathname => mayProxy.test(pathname), {
      target: proxy,
      logLevel: 'silent',
      onProxyReq: function(proxyReq, req, res) {

        if (proxyReq.getHeader('origin')) {
          proxyReq.setHeader('origin', proxy);
        }
      },
      onError: onProxyError(proxy),
      secure: false,
      changeOrigin: true,
      ws: true
    });
    devServer.use(mayProxy, hpm);
    
    devServer.listeningApp.on('upgrade', hpm.upgrade);
  }

  devServer.use(devServer.middleware);
}

function runDevServer(host, port, protocol) {
  var devServer = new WebpackDevServer(compiler, {
    
    compress: true,
    
    clientLogLevel: 'none',
    
    contentBase: paths.appPublic,
    
    hot: true,
    
    publicPath: config.output.publicPath,
    
    quiet: true,
    
    watchOptions: {
      ignored: /node_modules/
    },

    https: 
    // {
      // key: fs.readFileSync('/path/to/server.key'),
      // cert: fs.readFileSync('/path/to/server.crt'),
      // ca: fs.readFileSync('/path/to/ca.pem'),
    // }
    protocol === "https"
    ,
    host: host
  });

  addMiddleware(devServer);

  devServer.listen(port, (err, result) => {
    if (err) {
      return console.log(err);
    }

    if (isInteractive) {
      clearConsole();
    }
    console.log(chalk.cyan('Starting the development server...'));
    console.log();

    if (isInteractive) {
      openBrowser(protocol + '://' + host + ':' + port + '/');
    }
  });
}

function run(port) {
  var protocol = process.env.HTTPS === 'true' ? "https" : "http";
  var host = process.env.HOST || 'localhost';
  setupCompiler(host, port, protocol);
  runDevServer(host, port, protocol);
}

detect(DEFAULT_PORT).then(port => {
  if (port === DEFAULT_PORT) {
    run(port);
    return;
  }

  if (isInteractive) {
    clearConsole();
    var existingProcess = getProcessForPort(DEFAULT_PORT);
    var question =
      chalk.yellow('Something is already running on port ' + DEFAULT_PORT + '.' +
        ((existingProcess) ? ' Probably:\n  ' + existingProcess : '')) +
        '\n\nWould you like to run the app on another port instead?';

    prompt(question, true).then(shouldChangePort => {
      if (shouldChangePort) {
        run(port);
      }
    });
  } else {
    console.log(chalk.red('Something is already running on port ' + DEFAULT_PORT + '.'));
  }
});