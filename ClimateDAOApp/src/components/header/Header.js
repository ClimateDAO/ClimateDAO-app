import React, { useEffect, useContext, useState } from "react";
import classes from "./Header.module.css";
import chainLogo from "../../assets/chain_logo.svg";
import Web3Context from "../../store/Web3-Context";
import Navbar from "../navbar/Navbar";
import { NavLink } from "react-router-dom";
import { useLocation } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";

const Header = () => {
  const web3Ctx = useContext(Web3Context);
  const [showHamburger, setShowHamburger] = useState(false);
  const location = useLocation();

  const shortenAddress = (str) => {
    return str.substring(0, 6) + "..." + str.substring(str.length - 4);
  };

  useEffect(() => {
    web3Ctx.checkIfWalletConnected();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showHamburgerHandler = () => {
    setShowHamburger(true);
  };

  const hideHamburgerHandler = () => {
    setShowHamburger(false);
  };

  return (
    <>
      {showHamburger && (
        <div className={classes["hamburger-container"]}>
          <Navbar closeHandler={hideHamburgerHandler}></Navbar>
        </div>
      )}
      <div className={classes["header-container"]}>
        <div className={classes["box-one"]}>
          <NavLink to="/home">ClimateDAO</NavLink>
        </div>
        <div className={classes["box-two"]}>
          <NavLink activeClassName={classes["active"]} to="/leaderboard">
            <div className={classes["nav"]}>Leaderboard</div>
          </NavLink>
          <NavLink activeClassName={classes["active"]} to="/dashboard">
            <div className={classes["nav"]}>Dashboard</div>
          </NavLink>
          <NavLink activeClassName={classes["active"]} to="/propose">
            <div className={classes["nav"]}>Propose</div>
          </NavLink>
        </div>
        <div className={classes["box-three"]}>
          <img src={chainLogo} alt="chainLogo" />
          {web3Ctx.walletAddress ? (
            <div id={classes["wallet-connect"]}>
              {shortenAddress(web3Ctx.walletAddress)}
            </div>
          ) : (
            <div id={classes["wallet-connect"]} onClick={web3Ctx.connectWallet}>
              Connect
            </div>
          )}
        </div>
      </div>
      <div className={classes["header-mobile-container"]}>
        <div
          className={classes["menu-icon-container"]}
          onClick={showHamburgerHandler}
        >
          <MenuIcon />
        </div>
        <h2>
          {location.pathname.charAt(1).toUpperCase() +
            location.pathname.substring(2)}
        </h2>
      </div>
    </>
  );
};

export default Header;
