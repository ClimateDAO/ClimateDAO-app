import React, { useContext } from "react";
import classes from "./Home.module.css";
import twitterLogo from "../../assets/twitter_connect.svg";
import discordLogo from "../../assets/discord_connect.svg";
import polygonLogo from "../../assets/chain_logo.svg";
import contributeLogo from "../../assets/contribute.svg";
import proposeLogo from "../../assets/propose.svg";
import Web3Context from "../../store/Web3-Context";

const Home = () => {
  const web3Ctx = useContext(Web3Context);

  const shortenAddress = (str) => {
    return str.substring(0, 6) + "..." + str.substring(str.length - 4);
  };
  
  return (
    <div className={classes["home-container"]}>
      <div id={classes["bg-image"]}></div>
      <div id={classes["title"]}>ClimateDAO</div>
      <div id={classes["sub-title"]}>
      Tackling Climate Change through Investor Activism{" "}
      </div>
      <div id={classes["connect-container"]}>
        <div id={classes["connect"]}>
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
      <div id={classes["logo-container"]}>
        <a href="https://twitter.com/climate_dao?s=21" target="_blank">
          <img src={twitterLogo} alt="twitter_connect" />
        </a>
        <a href="https://discord.gg/sGFcJgXKJF" target="_blank">
          <img src={discordLogo} alt="discord_connect" />
        </a>
      </div>
      <div id={classes["built-container"]}>
        <div>Built on Polygon</div>
        <img src={polygonLogo} alt="polygon" width="35.85" height="35.85" />
      </div>
      <div id={classes["sub-title-2"]}>
        {" "}
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel sapien ac risus accumsan auctor non et mi. Pellentesque quis egestas ex. Sed non ultrices leo. 
      </div>
      <div id={classes["card-container"]}>
        <div className={classes["card"]}>
          <img src={proposeLogo} alt="propose" />
          <div className={classes["card-title"]}>Propose</div>
          <div className={classes["card-sub-title"]}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel sapien ac risus accumsan auctor non et mi. Pellentesque quis egestas ex. Sed non ultrices leo. 
          </div>
        </div>
        <div className={classes["card"]}>
          <img src={contributeLogo} alt="propose" />
          <div className={classes["card-title"]}>Contribute</div>
          <div className={classes["card-sub-title"]}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel sapien ac risus accumsan auctor non et mi. Pellentesque quis egestas ex. Sed non ultrices leo. 
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
