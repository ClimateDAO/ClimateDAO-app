import React, { useState, useContext, useEffect } from "react";
import classes from "./Propose.module.css";
import Web3Context from "../../store/Web3-Context";
import SnackbarUI from "../../components/snackbar/Snackbar";
import LoadingSpinner from "../../components/loading-spinner/LoadingSpinner";
import { useFirestore } from "reactfire";
import { doc, setDoc, runTransaction } from "firebase/firestore";
const { ethers } = require("ethers");

const Propose = () => {
  const web3Ctx = useContext(Web3Context);
  const firestore = useFirestore();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState({
    open: false,
    error: false,
    message: "",
  });

  const setProposalFirestore = async (id) => {
    try {
      setIsLoading(true);

      const titleDoc = localStorage.getItem("Title");
      const descriptionDoc = localStorage.getItem("Description");
      await setDoc(doc(firestore, "Proposals", id.toString()), {
        title: titleDoc,
        description: descriptionDoc,
        wallet: web3Ctx.walletAddress,
        contribution: 0,
        votes: 0,
        time: new Date().getTime() / 1000,
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
              proposals: 1,
              votes: 0,
              total: 1,
            }
          );
        } else {
          const newProposalCount = contributionDoc.data().proposals + 1;
          const newTotalCount = contributionDoc.data().total + 1;
          transaction.update(contributionDocRef, {
            contribution: newProposalCount,
            total: newTotalCount,
          });
        }
      });

      setIsLoading(false);
      toggleSnackbar(false, "Proposal Submitted");
      web3Ctx.setTransactionStateFinished();
    } catch (e) {
      setIsLoading(false);
      toggleSnackbar(true, "Failed to submit proposal");
      web3Ctx.setTransactionStateFinished();
      console.log(e);
    }
  };

  useEffect(() => {
    const propsalCreateHandler = async (id, event) => {
      await setProposalFirestore(id.toString());
    };
    web3Ctx.checkIfWalletConnected();

    web3Ctx.provider.once("block", () => {
      web3Ctx.governorContract.on("ProposalCreated", propsalCreateHandler);
    });

    return () => {
      web3Ctx.governorContract.off("ProposalCreated", propsalCreateHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSnackbar = (error, message) => {
    setSnackbarOpen({
      open: true,
      error: error,
      message: message,
    });
  };

  const titleChangeHandler = (value) => {
    setTitle(value);
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (isLoading) {
      return;
    }

    if (!title || !description) {
      toggleSnackbar(true, "Please populate both text fields");
      return;
    }

    localStorage.setItem("Title", title);
    localStorage.setItem("Description", description);

    try {
      web3Ctx.setTransactionState();
      const tx = await web3Ctx.governorContract.propose(
        [ethers.utils.getAddress("0x5e22B840656d2Ea9dE70ba9CA474793EaF773748")],
        [0],
        ["0x"],
        description
      );
      setIsLoading(true);
      await tx.wait();
    } catch (e) {
      web3Ctx.setTransactionStateFinished();
      setIsLoading(false);
      toggleSnackbar(true, "Transaction Failed");
    }
  };

  return (
    <div className={classes["propose-container"]}>
      <div id={classes["propose-title"]}>Create a Proposal 🌲</div>
      <div id={classes["propose-sub-title"]}>
        Create a proposal to vote on for the protocol
      </div>
      <div className={classes["divider-container"]}>
        <div id={classes["horiz-divider"]}></div>
      </div>
      <div>
        <div className={classes["form-container"]}>
          <form onSubmit={submitHandler}>
            <div id={classes["form-title"]}>Title</div>
            <input
              type="text"
              id={classes["input-one"]}
              placeholder="Enter Title"
              value={title}
              onChange={(e) => {
                titleChangeHandler(e.target.value);
              }}
            />
            <div id={classes["form-title-two"]}>Description</div>
            <textarea
              type="text"
              id={classes["input-two"]}
              placeholder="Enter Description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
            />
            <div id={classes["button-container"]}>
              <button type="submit">
                {isLoading ? <LoadingSpinner /> : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
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

export default Propose;
