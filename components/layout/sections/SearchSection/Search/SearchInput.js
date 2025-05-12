"use client";

import React, { useEffect, useRef, useState } from "react";
import classes from "./Search.module.scss";
import { join } from "@/utils/helper-client";

const placeholders = ["PHY136H5 F", "MIE245H1 S", "MAT137Y1 Y", "MAT223H5 F", "MAT223H5 S"];

const SearchInput = ({ query, setQuery, isDisabled }) => {
  const [placeholderVisible, setPlaceholderVisible] = useState(true);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (query === "") {
      timeoutRef.current = setTimeout(() => {
        setPlaceholderVisible(true);
      }, 1500);
    } else {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setPlaceholderVisible(false);
      setPlaceholderIndex((p) => (p + 1) % placeholders.length);
    }
  }, [query]);

  useEffect(() => {
    if (placeholderVisible) {
      timeoutRef.current = setTimeout(() => {
        setPlaceholderIndex((p) => (p + 1) % placeholders.length);
      }, 5000);
    }
  }, [placeholderVisible, placeholderIndex]);

  return (
    <div className={classes.Input}>
      <span className={join(classes.InputPlaceholders, query !== "" ? classes.hidden : "")}>
        {placeholders.map((placeholder, index) => (
          <span
            key={placeholder}
            className={join(
              classes.InputPlaceholder,
              placeholderVisible && index === placeholderIndex ? classes.active : "",
              query !== "" ? classes.instant : ""
            )}
          >
            {placeholder}
          </span>
        ))}
      </span>
      <input
        placeholder={placeholders[placeholderIndex]}
        onChange={(e) => setQuery(e.target.value.trim())}
        disabled={isDisabled}
      />
    </div>
  );
};

export default SearchInput;
