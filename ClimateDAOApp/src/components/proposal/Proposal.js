import React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import classes from "./Proposal.module.css";

const Proposal = (props) => {
  const windowWidth = window.innerWidth;
  let accordionWidth;
  let paddingLeft;
  let accordionHeight = "69.55px";
  if (windowWidth < 1200 && windowWidth > 600) {
    accordionWidth = "800px";
    paddingLeft = "1rem";
  } else if (windowWidth < 500) {
    accordionWidth = "310px";
    accordionHeight = "132px";
  } else {
    accordionWidth = "1159px";
    paddingLeft = "52rem";
  }
  const voteClickHandler = () => {
    props.openModalHandler(props.id);
  };
  return (
    <Accordion
      sx={{
        height: accordionHeight,
        width: accordionWidth,
        background: "rgba(0, 0, 0, 0.02)",
        boxShadow: "none",
        borderRadius: "8px",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        zIndex: "0",
      }}
      spacing={5}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel2a-content"
        id="panel1a-header"
        sx={{
          paddingTop: "0.7rem",
          zIndex: "0",
          height: windowWidth < 500 ? accordionHeight : 0,
        }}
      >
        <Typography
          sx={{ fontWeight: "bold", width: windowWidth > 600 && "50%" }}
        >
          {props.title}
        </Typography>
        <Typography
          sx={{
            paddingLeft: paddingLeft,
            flexGrow: 5,
          }}
        >
          <span id={classes["vote-count"]}>Votes: {props.votes} </span>
        </Typography>

        <Typography>
          <span
            id={classes["vote"]}
            onClick={voteClickHandler}
            style={{ zIndex: 2 }}
          >
            Vote
          </span>
        </Typography>
      </AccordionSummary>
      <AccordionDetails
        sx={{
          background: "rgba(0, 0, 0, 0.02)",
          boxShadow: "none",
          borderRadius: "8px",
        }}
      >
        <Typography sx={{}}>{props.description}</Typography>
      </AccordionDetails>
    </Accordion>
  );
};

export default Proposal;
