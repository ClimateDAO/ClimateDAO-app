import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import Web3Provider from "./store/Web3Provider";
import { BrowserRouter } from "react-router-dom";
import { FirebaseAppProvider } from "reactfire";

const firebaseConfig = {
  apiKey: "AIzaSyAOzf0G73rJN6GibTl_1_8QfnpLqpPCIm4",
  authDomain: "climatedao-8fdb5.firebaseapp.com",
  databaseURL: "https://climatedao-8fdb5-default-rtdb.firebaseio.com",
  projectId: "climatedao-8fdb5",
  storageBucket: "climatedao-8fdb5.appspot.com",
  messagingSenderId: "478624164454",
  appId: "1:478624164454:web:85babccbf9530ac7fb5ba7",
  measurementId: "G-E829D3LL4P",
};

ReactDOM.render(
  <FirebaseAppProvider firebaseConfig={firebaseConfig}>
    <BrowserRouter>
      <Web3Provider>
        <App />
      </Web3Provider>
    </BrowserRouter>
  </FirebaseAppProvider>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
