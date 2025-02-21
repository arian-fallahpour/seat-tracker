"use client";

import React, { useEffect, useState } from "react";
import classes from "./Search.module.scss";

import axios from "axios";
import debounce from "lodash.debounce";

import SearchResults from "./SearchResults";
import { SearchIcon } from "@/components/elements/icons/SearchIcon";
import { config } from "@/utils/config";
import { createURL } from "@/utils/helper";

// TODO: Potentially optimize search query using revalidation
// TODO: Implement accessibility

const Search = () => {
  const school = "uoft";

  const [value, setValue] = useState("");
  const [courses, setCourses] = useState([]);
  const [isFocused, setIsFocused] = useState(false);

  // Run search query
  useEffect(() => {
    const fetchCourses = debounce(async () => {
      const url = await createURL(`/${config.apiPath}/courses/search/${school}?query=${value}`);
      const { data } = await axios({ url, method: "GET" });
      const { courses } = data.data;

      setCourses(courses);
    }, 500);

    if (!value || value === "") {
      setCourses([]);
    } else {
      fetchCourses();
    }
  }, [value]);

  return (
    <div
      className={classes.Search}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      <div className={classes.SearchMain}>
        <input
          className={classes.SearchInput}
          placeholder="course code, name..."
          onChange={(e) => setValue(e.target.value)}
        />

        <div className={classes.SearchIcon}>
          <SearchIcon />
        </div>
      </div>

      <div className={classes.SearchResults} onMouseDown={(e) => e.preventDefault()}>
        {courses.length > 0 && isFocused && <SearchResults courses={courses} />}
      </div>
    </div>
  );
};

export default Search;
