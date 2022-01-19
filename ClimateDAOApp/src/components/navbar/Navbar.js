import React, { useContext } from "react";
import "./Navbar.css";
import chainLogo from "../../assets/chain_logo.svg";
import Web3Context from "../../store/Web3-Context";
import { NavLink } from "react-router-dom";
import CloseSharpIcon from "@mui/icons-material/CloseSharp";

const Navbar = (props) => {
  const web3Ctx = useContext(Web3Context);

  const closeHandler = () => {
    props.closeHandler();
  };
  const shortenAddress = (str) => {
    return str.substring(0, 6) + "..." + str.substring(str.length - 4);
  };
  return (
    <div className="navbar-container">
      <NavLink to="/">
        <h1>ClimateDAO</h1>
      </NavLink>
      <div className="icon-container" onClick={closeHandler}>
        <CloseSharpIcon />
      </div>

      <div className="connect-container">
        {web3Ctx.walletAddress ? (
          <div id="wallet-connect">{shortenAddress(web3Ctx.walletAddress)}</div>
        ) : (
          <div id="wallet-connect" onClick={web3Ctx.connectWallet}>
            Connect
          </div>
        )}
        <img src={chainLogo} alt="chainLogo" />
      </div>
      <div className="link-container">
        <NavLink activeClassName="active" to="/leaderboard">
          <div className="nav">Leaderboard</div>
        </NavLink>
        <NavLink activeClassName="active" to="/dashboard">
          <div className="nav">Dashboard</div>
        </NavLink>
        <NavLink activeClassName="active" to="/propose">
          <div className="nav">Propose</div>
        </NavLink>
      </div>
    </div>
  );
};

export default Navbar;
