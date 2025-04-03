"use client";

import React, { useCallback, useContext, useEffect, useState } from "react";
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

  const [query, setQuery] = useState("");
  const [courses, setCourses] = useState([]);
  const [isFocused, setIsFocused] = useState(false);

  // Fetch courses in a debounced manner
  const searchCourses = useCallback(
    debounce(async (query) => {
      try {
        const { data } = await axios({
          url: `/${config.API_PATH}/courses/search?query=${query}`,
          method: "GET",
        });

        const { courses } = data.data;

        setCourses(courses);
      } catch (axiosError) {
        const { message } = axiosError.response.data;
        const error = new Error(message);

        setGlobalError(error);
      }
    }, 500),
    []
  );

  // Run search query when value of input changes
  useEffect(() => {
    if (!query || query === "") {
      return setCourses([]);
    }

    searchCourses(query);
  }, [query]);

  return (
    <div
      className={classes.Search}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      <div className={classes.SearchMain}>
        <input
          className={classes.SearchInput}
          placeholder="e.g. MIE245H1 S"
          onChange={(e) => setQuery(e.target.value)}
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
