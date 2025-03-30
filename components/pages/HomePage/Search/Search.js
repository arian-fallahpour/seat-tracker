"use client";

import React, { useContext, useEffect, useState } from "react";
import classes from "./Search.module.scss";

import axios from "axios";
import debounce from "lodash.debounce";

import SearchResults from "./SearchResults";
import { SearchIcon } from "@/components/elements/icons/SearchIcon";
import { GlobalErrorContext } from "@/store/global-error-context";
import config from "@/utils/config";

// TODO: Potentially optimize search query using revalidation
// TODO: Implement accessibility

const Search = () => {
  const { setGlobalError } = useContext(GlobalErrorContext);
  const [value, setValue] = useState("");
  const [courses, setCourses] = useState([]);
  const [isFocused, setIsFocused] = useState(false);

  // Fetch courses in a debounced manner
  const fetchCourses = debounce(async () => {
    try {
      const url = `/${config.API_PATH}/courses/search?query=${value}`;
      const { data } = await axios({ url, method: "GET" });
      const { courses } = data.data;

      setCourses(courses);
    } catch (axiosError) {
      const { message } = axiosError.response.data;
      const error = new Error(message);

      setGlobalError(error);
    }
  }, 500);

  // Run search query when value of input changes
  useEffect(() => {
    if (!value || value === "") {
      return setCourses([]);
    }

    fetchCourses();
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
