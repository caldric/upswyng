import React, { useState } from "react";

import Alert from "@material-ui/lab/Alert";
import AlertsDrawer from "./AlertsDrawer";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import ExpandMore from "@material-ui/icons/ExpandMore";
import { TStatusFetch } from "@upswyng/types";
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import makeStyles from "@material-ui/styles/makeStyles";
import useAlerts from "./useAlerts";

const useAlertStyles = makeStyles((theme: Theme) => ({
  root: {
    background: "none",
    color: theme.palette.common.white,
    cursor: "pointer",
    paddingLeft: 0,
    paddingRight: 0,
  },
  icon: {
    "&&": {
      color: theme.palette.common.white,
    },
  },
}));

const GlobalAlertBar = () => {
  const [status, alerts] = useAlerts();
  const alertClasses = useAlertStyles();
  const [viewingAlerts, setViewingAlerts] = useState(false);

  if (status !== TStatusFetch.STATUS_FETCH_SUCCESS || !alerts?.length) {
    return null;
  }

  const sortedAlerts = alerts.sort(
    (a1, a2) => new Date(a1.start).getTime() - new Date(a2.start).getTime()
  );
  const [firstAlert] = sortedAlerts;
  const alertButtonText = [
    "View",
    alerts.length > 1 ? alerts.length : "",
    alerts.length > 1 ? "Alerts" : "Alert",
  ].reduce((acc, item) => (item ? `${acc} ${item}` : acc), "");
  const toggleDrawer = () => setViewingAlerts(b => !b);

  return (
    <>
      <Box bgcolor={firstAlert.color || "primary.main"} color="common.white">
        <Container>
          <Alert
            action={
              <Button endIcon={<ExpandMore />} size="small" variant="text">
                {alertButtonText}
              </Button>
            }
            classes={alertClasses}
            icon={<span className={firstAlert.icon} />}
            onClick={toggleDrawer}
          >
            {firstAlert.title}
          </Alert>
        </Container>
      </Box>
      <AlertsDrawer
        alerts={sortedAlerts}
        anchor="top"
        open={viewingAlerts}
        onClose={toggleDrawer}
        toggleDrawer={toggleDrawer}
      />
    </>
  );
};

export default GlobalAlertBar;
