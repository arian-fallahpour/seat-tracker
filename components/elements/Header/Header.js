import React from "react";
import classes from "./Header.module.scss";

const Header = () => {
  return (
    <header className={classes.Header}>
      <h1 className="header header-title">Seat Tracker</h1>
      <p className="paragraph">Search for courses to send alerts from the University Of Toronto</p>
    </header>
  );
};

export default Header;
