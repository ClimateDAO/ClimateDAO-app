import React from "react";
import classes from "./Leaderboard.module.css";
import LeaderboardEntry from "../../components/leaderboard-entry/LeaderboardEntry";
import LoadingSpinner from "../../components/loading-spinner/LoadingSpinner";
import {
  FirestoreProvider,
  useFirestoreDocData,
  useFirestore,
  useFirebaseApp,
  useFirestoreCollectionData,
} from "reactfire";
import { collection, query, orderBy } from "firebase/firestore";

const Leaderboard = () => {
  const firestore = useFirestore();
  const contributionCollection = collection(firestore, "Contributions");
  const contributionQuery = query(
    contributionCollection,
    orderBy("total", "desc")
  );
  // ReactFire!
  const { status, data: contributions } = useFirestoreCollectionData(
    contributionQuery,
    {
      idField: "id", // this field will be added to the object created from each document
    }
  );

  let contrubtionJsx = <></>;
  if (contributions) {
    contrubtionJsx = contributions.map((contribution, index) => (
      <li key={Math.random(100)}>
        <LeaderboardEntry
          rank={index + 1}
          wallet={contribution.wallet}
          contribution={contribution.total}
        />
      </li>
    ));
  }

  return (
    <>
      <div id={classes["propose-title"]}>Leader 🥇</div>
      <div id={classes["propose-sub-title"]}>
        Top Contributors to ClimateDAO
      </div>
      <div className={classes["divider-container"]}>
        <div id={classes["horiz-divider"]}></div>
      </div>
      <div className={classes["entry-header"]}>
        <div id={classes["rank-wallet"]}>
          <div id={classes["rank"]}>Rank</div>
          <div id={classes["wallet"]}>Wallet</div>
        </div>
        <div id={classes["contribution"]}>
          <div id={classes["contribution-text"]}>Contributions</div>
        </div>
      </div>
      <div className={classes["entry-container"]}>
        {status === "loading" ? <LoadingSpinner /> : contrubtionJsx}
      </div>
    </>
  );
};

export default Leaderboard;
