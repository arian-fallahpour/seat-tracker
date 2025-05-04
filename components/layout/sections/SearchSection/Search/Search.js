"use client";

import React, { useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import classes from "./Search.module.scss";

import SearchResults from "./SearchResults";
import Loader from "@/components/elements/Loader/Loader";
import { SearchIcon } from "@/components/elements/icons/SearchIcon";
import config from "@/utils/config";
import { join } from "@/utils/helper-client";
import { GlobalErrorContext } from "@/store/global-error-context";

const Search = ({ isDisabled }) => {
  const { pushGlobalError } = useContext(GlobalErrorContext);

  const [query, setQuery] = useState("");
  const [courses, setCourses] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
        pushGlobalError(axiosError.response.data.message);
      }

      setIsLoading(false);
    }, 500),
    []
  );

  // Run search query when value of input changes
  useEffect(() => {
    if (!query || query === "") {
      return setCourses([]);
    }

    setIsLoading(true);

    searchCourses(query);
  }, [query]);

  return (
    <div
      className={join(
        classes.Search,
        isFocused ? classes.focused : null,
        isDisabled ? classes.disabled : null
      )}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      <div className={classes.SearchMain}>
        <input
          className={classes.SearchInput}
          placeholder="e.g. MIE245H1 S"
          onChange={(e) => setQuery(e.target.value.trim())}
          disabled={isDisabled}
        />

        <div className={join(classes.SearchIcon, !isLoading ? classes.visible : null)}>
          <SearchIcon />
        </div>
        <div className={join(classes.SearchIcon, isLoading ? classes.visible : null)}>
          <Loader />
        </div>
      </div>

      <div className={classes.SearchResults} onMouseDown={(e) => e.preventDefault()}>
        {courses.length > 0 && isFocused && <SearchResults courses={courses} />}
      </div>
    </div>
  );
};

export default Search;
