import React from "react";
import classes from "./LeaderboardEntry.module.css";

const LeaderboardEntry = (props) => {
  const windowWidth = window.innerWidth;
  const shortenAddress = (str) => {
    return str.substring(0, 6) + "..." + str.substring(str.length - 4);
  };

  return (
    <div className={classes["entry"]}>
      <div className={classes["col-one"]}>
        <div>#{props.rank}</div>
        <div id={classes["wallet"]}>
          {windowWidth <= 510 ? shortenAddress(props.wallet) : props.wallet}
        </div>
      </div>
      <div id={classes["contribution"]}>{props.contribution}</div>
    </div>
  );
};

export default LeaderboardEntry;
