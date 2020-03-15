import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import './css/oswald.css';
import './css/open-sans.css';
import './css/pure-min.css';
import './App.css';

import Dashboard from './containers/Dashboard';

class App extends Component {
    render() {
      return (
        <Router>
          <Switch>
            <Route exact path='/' component={Dashboard} />
            <Redirect to='/' />
          </Switch>
        </Router>
      );
    }
}

export default App;