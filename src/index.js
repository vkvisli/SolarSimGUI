/***********************************************
 Copyright 2019 Vebjørn Kvisli
 License: GNU Lesser General Public License v3.0
 ***********************************************/

import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import green from '@material-ui/core/colors/green';

// Configure the theme of the app
const theme = createMuiTheme({
  palette: {
    primary: { main: green["A700"] },
    secondary: { main: "#000000" }
  },
  typography: {
    useNextVariants: true
  }
});

// Set the theme as a parent of the App component
var themedApp = (
  <MuiThemeProvider theme={theme}>
    <App />
  </MuiThemeProvider>
);

// Render the App
ReactDOM.render(themedApp, document.getElementById('root'));




// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
