"use client";

import React, { useEffect, useRef, useState } from "react";
import classes from "./Search.module.scss";

const placeholders = ["PHY136H5 F", "MIE245H1 S", "MAT137Y1 Y", "MAT223H5 F", "MAT223H5 S"];

const SearchInput = ({ query, setQuery, isDisabled }) => {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderIndexLetter, setPlaceholderIndexLetter] = useState(0);
  const [placeholder, setPlaceholder] = useState("");
  const placeholderTimeout = useRef(null);

  const nextPlaceholderWord = () => {
    setPlaceholderIndex((p) => (p + 1) % placeholders.length);
    setPlaceholderIndexLetter(0);
    setPlaceholder("");
  };

  const nextPlaceholderLetter = () => {
    setPlaceholderIndexLetter((p) => p + 1);
    setPlaceholder(placeholders[placeholderIndex].slice(0, placeholderIndexLetter + 1));
  };

  useEffect(() => {
    if (placeholderTimeout.current) clearTimeout(placeholderTimeout.current);

    if (query !== "") {
      return nextPlaceholderWord();
    }

    if (placeholderIndex === 0 && placeholderIndexLetter === 0) {
      placeholderTimeout.current = setTimeout(() => {
        nextPlaceholderLetter();
      }, 1500);
    } else if (placeholderIndexLetter === 0) {
      placeholderTimeout.current = setTimeout(() => {
        nextPlaceholderLetter();
      }, 3000);
    } else if (placeholder === placeholders[placeholderIndex]) {
      placeholderTimeout.current = setTimeout(() => {
        nextPlaceholderWord();
      }, 2000);
    } else {
      placeholderTimeout.current = setTimeout(() => {
        nextPlaceholderLetter();
      }, 150);
    }
  }, [query, placeholder]);

  return (
    <input
      className={classes.SearchInput}
      placeholder={placeholder}
      onChange={(e) => setQuery(e.target.value.trim())}
      disabled={isDisabled}
    />
  );
};

export default SearchInput;
