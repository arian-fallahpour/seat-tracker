import React from "react";
import classes from "./AlertsCount.module.scss";

const Alerts = ({ count }) => {
  return (
    <div className={classes.AlertsCount}>
      <div className={classes.Indicator}>
        <span className={classes.IndicatorInner} />
        <span className={classes.IndicatorOuter} />
      </div>
      <span className={classes.Count}>Active Alerts: {count}</span>
    </div>
  );
};

export default Alerts;
