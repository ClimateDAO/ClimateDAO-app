import React, { useContext, useEffect } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import "./App.css";
import LoadingSpinner from "./components/loading-spinner/LoadingSpinner";
import Layout from "./components/layout/Layout";
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import Home from "./pages/home/Home";
import Propose from "./pages/propose/Propose";
import Leaderboard from "./pages/leaderboard/Leaderboard";
import Dashboard from "./pages/dashboard/Dashboard";
import Web3Context from "./store/Web3-Context";
import {
  initializeFirestore,
  enableIndexedDbPersistence,
} from "firebase/firestore";
import { useInitFirestore, FirestoreProvider } from "reactfire";

function App() {
  const web3Ctx = useContext(Web3Context);
  const { status, data: firestoreInstance } = useInitFirestore(
    async (firebaseApp) => {
      const db = initializeFirestore(firebaseApp, {});
      await enableIndexedDbPersistence(db);
      return db;
    }
  );

  useEffect(() => {
    web3Ctx.checkIfWalletConnected();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // firestore init isn't complete yet
  if (status === "loading") {
    return <LoadingSpinner />;
  }
  return (
    <FirestoreProvider sdk={firestoreInstance}>
      <Layout>
        <Header />
        <Switch>
          <Route path="/" exact>
            <Redirect to="/home" />
          </Route>
          <Route path="/home">
            <Home />
          </Route>
          <Route path="/propose">
            {status === "loading" || !web3Ctx.walletAddress ? (
              <Home />
            ) : (
              <Propose />
            )}
          </Route>
          <Route path="/dashboard">
            {status === "loading" || !web3Ctx.walletAddress ? (
              <Home />
            ) : (
              <Dashboard />
            )}
          </Route>
          <Route path="/leaderboard">
            {status === "loading" || !web3Ctx.walletAddress ? (
              <Home />
            ) : (
              <Leaderboard />
            )}
          </Route>
          <Redirect from="*" to="/" />
        </Switch>
        <Footer />
      </Layout>
    </FirestoreProvider>
  );
}

export default App;
