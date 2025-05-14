import React from "react";
import classes from "./Search.module.scss";
import SearchResult from "./SearchResult";

const SearchResults = ({ courses }) => {
  return (
    <div className={classes.Results}>
      {courses.map((course) => (
        <SearchResult {...course} key={course.code} />
      ))}
    </div>
  );
};

export default SearchResults;
