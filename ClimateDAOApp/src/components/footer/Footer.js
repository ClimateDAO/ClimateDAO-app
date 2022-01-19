import React from "react";
import classes from "./Footer.module.css";
import twitterLogo from "../../assets/twitter.svg";
import telegramLogo from "../../assets/telegram.svg";
import discordLogo from "../../assets/Discord white.png";

const Footer = () => {
  return (
    <div className={classes["footer-container"]}>
      <div className={classes["icons"]}>
        <div>
          <a href="https://twitter.com/climate_dao?s=21" target="_blank">
            {" "}
            <img src={twitterLogo} alt="twitter" />
          </a>
        </div>
        <div>
          <a href="https://discord.com/invite/sGFcJgXKJF" target="_blank">
            <img src={discordLogo} alt="telegram" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Footer;
