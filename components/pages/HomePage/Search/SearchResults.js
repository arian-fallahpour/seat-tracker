import React from "react";
import classes from "./Search.module.scss";
import SearchResult from "./SearchResult";

const SearchResults = ({ courses }) => {
  return (
    <div className={classes.Results}>
      {courses.map((course) => (
        <SearchResult key={course.code} {...course} />
      ))}
    </div>
  );
};

export default SearchResults;
