import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';


// Define your configuration for Firebase
let config = {
    apiKey: "AIzaSyBe1nsyQz1E1IR4-SvFwJwYQd8znrb7nWk",
    authDomain: "p4-climbingapp.firebaseapp.com",
    databaseURL: "https://p4-climbingapp.firebaseio.com",
    projectId: "p4-climbingapp",
    storageBucket: "p4-climbingapp.appspot.com",
    messagingSenderId: "164108016356"
};
firebase.initializeApp(config);

// Initialize the firebase app using the config

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
