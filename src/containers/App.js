import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Dashboard from './Dashboard';
import Landing from './Landing';

class App extends Component {
    render() {
      return (
        <Router>
          <ToastContainer />
          <Switch>
            <Route exact path='/' component={Landing} />
            <Route exact path='/dashboard' component={Dashboard} />
            <Redirect to='/' />
          </Switch>
        </Router>
      );
    }
}

export default App;