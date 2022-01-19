import React, { useEffect } from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function SnackbarUI(props) {
  const windowWidth = window.innerWidth;
  let snackbardWidth = "100%";

  if (windowWidth < 500) {
    snackbardWidth = "20%";
  }
  const [open, setOpen] = React.useState(true);

  useEffect(() => {
    return () => {
      setOpen();
    };
  }, []);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    props.closeHandler(false);
    setOpen(false);
  };

  return (
    <div className="snackbar-container">
      <Snackbar open={open} autoHideDuration={5000} onClose={handleClose}>
        <Alert
          onClose={handleClose}
          severity={props.error ? "error" : "success"}
          sx={{ width: snackbardWidth }}
        >
          {props.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
