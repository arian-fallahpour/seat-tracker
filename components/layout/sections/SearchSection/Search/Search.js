"use client";

import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import debounce from "lodash.debounce";
import classes from "./Search.module.scss";

import SearchResults from "./SearchResults";
import Loader from "@/components/elements/Loader/Loader";
import SearchIcon from "@/components/elements/icons/SearchIcon";
import config from "@/utils/config";
import { join } from "@/utils/helper-client";
import { GlobalErrorContext } from "@/store/global-error-context";
import SearchInput from "./SearchInput";

const Search = ({ isDisabled }) => {
  const { pushGlobalError } = useContext(GlobalErrorContext);

  const [query, setQuery] = useState("");
  const [courses, setCourses] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);

  // Fetch courses in a debounced manner
  const searchCourses = useCallback(
    debounce(async (query) => {
      const response = await fetch(`/${config.API_PATH}/courses/search?query=${query}`, {
        cache: "force-cache",
      });
      const body = await response.json();
      setIsLoading(false);

      if (!response.ok) {
        return pushGlobalError(body.message);
      }

      setCourses(body.data.courses);
    }, 500),
    []
  );

  const onBlurHandler = (e) => {
    if (!searchRef.current.contains(e.relatedTarget)) {
      setIsFocused(false);
    }
  };

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
      onBlur={onBlurHandler}
      ref={searchRef}
    >
      <div className={classes.SearchField}>
        <div className={classes.SearchInput}>
          <SearchInput query={query} setQuery={setQuery} isDisabled={isDisabled} />
        </div>

        <div className={join(classes.SearchIcon, !isLoading ? classes.visible : null)}>
          <SearchIcon />
        </div>
        <div className={join(classes.SearchIcon, isLoading ? classes.visible : null)}>
          <Loader />
        </div>
      </div>
      <div
        className={join(
          classes.SearchResults,
          courses.length > 0 && isFocused ? classes.visible : null
        )}
        onMouseDown={(e) => e.preventDefault()}
      >
        <SearchResults courses={courses} />
      </div>
    </div>
  );
};

export default Search;
