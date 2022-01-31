import React, { useContext, useState } from "react";
import classes from "./Dashboard.module.css";
import Proposal from "../../components/proposal/Proposal";
import LoadingSpinner from "../../components/loading-spinner/LoadingSpinner";
import SnackbarUI from "../../components/snackbar/Snackbar";
import Web3Context from "../../store/Web3-Context";
import { useFirestore, useFirestoreCollectionData } from "reactfire";
import {
  collection,
  query,
  orderBy,
  doc,
  updateDoc,
  runTransaction,
  setDoc,
} from "firebase/firestore";
import PropTypes from "prop-types";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";

const options = ["For", "Against", "Abstain"];

function SimpleDialog(props) {
  const { onClose, selectedValue, open } = props;

  const handleClose = () => {
    onClose(selectedValue);
  };

  const handleListItemClick = (value) => {
    onClose(value);
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Vote on Proposal</DialogTitle>
      <List sx={{ pt: 0, textAlign: "center" }}>
        {options.map((option) => (
          <ListItem
            button
            onClick={() => handleListItemClick(option)}
            key={option}
          >
            <ListItemText primary={option} />
          </ListItem>
        ))}
      </List>
    </Dialog>
  );
}

SimpleDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  selectedValue: PropTypes.string.isRequired,
};

const Dashboard = () => {
  const web3Ctx = useContext(Web3Context);
  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState("For");
  const [proposalId, setCurrentProposalId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState({
    open: false,
    error: false,
    message: "",
  });
  const [viewMode, setViewMode] = useState("All");
  const firestore = useFirestore();
  const proposalCollection = collection(firestore, "Proposals");

  const proposalQuery = query(
    proposalCollection,
    orderBy("contribution", "asc")
  );
  const { status, data: proposals } = useFirestoreCollectionData(
    proposalQuery,
    {
      idField: "id",
    }
  );

  const proposalQueryMostVotes = query(
    proposalCollection,
    orderBy("votes", "desc")
  );
  const { statusMostVotes, data: proposalsMostVotes } =
    useFirestoreCollectionData(proposalQueryMostVotes, {
      idField: "id",
    });

  const proposalQueryNewest = query(
    proposalCollection,
    orderBy("time", "desc")
  );
  const { statusNewest, data: proposalsNewest } = useFirestoreCollectionData(
    proposalQueryNewest,
    {
      idField: "id",
    }
  );

  const toggleSnackbar = (error, message) => {
    setSnackbarOpen({
      open: true,
      error: error,
      message: message,
    });
  };

  const handleClickOpen = (id) => {
    setCurrentProposalId(id);
    setOpen(true);
  };

  const updateProposalDoc = async (newVoteCount) => {
    const proposalRef = doc(firestore, "Proposals", proposalId.toString());

    await updateDoc(proposalRef, {
      votes: newVoteCount,
    });

    const contributionDocRef = doc(
      firestore,
      "Contributions",
      web3Ctx.walletAddress.toString()
    );

    await runTransaction(firestore, async (transaction) => {
      const contributionDoc = await transaction.get(contributionDocRef);
      if (!contributionDoc.exists()) {
        await setDoc(
          doc(firestore, "Contributions", web3Ctx.walletAddress.toString()),
          {
            wallet: web3Ctx.walletAddress,
            proposals: 0,
            votes: 1,
            total: 1,
          }
        );
      } else {
        const newVoteCount = contributionDoc.data().votes + 1;
        const newTotalCount = contributionDoc.data().total + 1;
        transaction.update(contributionDocRef, {
          votes: newVoteCount,
          total: newTotalCount,
        });
      }
    });
  };

  const castVote = async (vote) => {
    try {
      let tx;
      switch (vote) {
        case "For":
          tx = await web3Ctx.governorContract.castVote(proposalId, 1);
          await tx.wait();
          break;
        case "Against":
          tx = await web3Ctx.governorContract.castVote(proposalId, 0);
          await tx.wait();
          break;
        case "Abstain":
          tx = await web3Ctx.governorContract.castVote(proposalId, 2);
          await tx.wait();
          break;
        default:
          break;
      }

      const targetProposal = proposals.find(
        (proposal) => proposal.id === proposalId
      );
      const currentVotes = targetProposal.votes;

      updateProposalDoc(currentVotes + 1);
      toggleSnackbar(false, "Vote submitted");
    } catch (e) {
      toggleSnackbar(true, "Failed to submit vote");
    }
  };

  const handleClose = async (value) => {
    console.log(value);
    setOpen(false);
    castVote(value);
  };

  let proposalDashboardJsx = <></>;
  if (proposals) {
    proposalDashboardJsx = proposals.map((proposal) => (
      <Proposal
        key={proposal.id}
        title={proposal.title}
        description={proposal.description}
        votes={proposal.votes}
        openModalHandler={handleClickOpen}
        id={proposal.id}
      />
    ));
  }

  let proposalDashboardJsxMostVotes = <></>;
  if (proposalsMostVotes) {
    proposalDashboardJsxMostVotes = proposalsMostVotes.map((proposal) => (
      <Proposal
        key={proposal.id}
        title={proposal.title}
        description={proposal.description}
        votes={proposal.votes}
        openModalHandler={handleClickOpen}
        id={proposal.id}
      />
    ));
  }

  let proposalDashboardJsxNewest = <></>;
  if (proposalsNewest) {
    proposalDashboardJsxNewest = proposalsNewest.map((proposal) => (
      <Proposal
        key={proposal.id}
        title={proposal.title}
        description={proposal.description}
        votes={proposal.votes}
        openModalHandler={handleClickOpen}
        id={proposal.id}
      />
    ));
  }

  return (
    <div className={classes["dashboard-container"]}>
      <div id={classes["propose-title"]}>Dashboard ⛓</div>
      <div id={classes["propose-sub-title"]}>Vote on any active proposal</div>
      <div className={classes["divider-container"]}>
        <div id={classes["horiz-divider"]}></div>
      </div>
      <div className={classes["dashboard-header"]}>
        <div className={classes["total-active"]}>
          Total Active Proposals: {proposals && proposals.length}
        </div>
        <div className={classes["view-row"]}>
          <div id={classes["view"]}>View:</div>
          <div
            className={classes["view-elem"]}
            style={{ color: viewMode === "All" && "#8247E5" }}
            onClick={() => {
              setViewMode("All");
            }}
          >
            All
          </div>
          <div
            className={classes["view-elem"]}
            style={{ color: viewMode === "MostVotes" && "#8247E5" }}
            onClick={() => {
              setViewMode("MostVotes");
            }}
          >
            Most Votes
          </div>
          <div
            className={classes["view-elem"]}
            style={{ color: viewMode === "Newest" && "#8247E5" }}
            onClick={() => {
              setViewMode("Newest");
            }}
          >
            Newest
          </div>
          <div
            className={classes["view-elem"]}
            style={{ color: viewMode === "Completed" && "#8247E5" }}
          >
            Completed Proposals
          </div>
        </div>
      </div>

      <div className={classes["outer-container"]}>
        <div className={classes["accordion-container"]}>
          {status === "loading" && <LoadingSpinner />}
          {status !== "loading" && viewMode === "All" && proposalDashboardJsx}
          {status !== "loading" &&
            viewMode === "MostVotes" &&
            proposalDashboardJsxMostVotes}
          {status !== "loading" &&
            viewMode === "Newest" &&
            proposalDashboardJsxNewest}
        </div>
      </div>
      <SimpleDialog
        open={open}
        onClose={handleClose}
        selectedValue={selectedValue}
      />
      {snackbarOpen.open && (
        <SnackbarUI
          error={snackbarOpen.error}
          message={snackbarOpen.message}
          closeHandler={setSnackbarOpen}
        />
      )}
    </div>
  );
};

export default Dashboard;

//0 = Against, 1 = For, 2 = Abstain
