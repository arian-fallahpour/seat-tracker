"use client";

import React, { useEffect, useRef, useState } from "react";
import classes from "./Search.module.scss";
import { join } from "@/utils/helper-client";
import { AnimatePresence, motion } from "motion/react";

const placeholders = ["PHY136H5 F", "MIE245H1 S", "MAT137Y1 Y", "MAT223H5 F", "MAT223H5 S"];

const SearchInput = ({ query, setQuery, isDisabled }) => {
  const [placeholderVisible, setPlaceholderVisible] = useState(true);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const timeoutRef = useRef(null);

  const nextIndex = (i) => (i + 1) % placeholders.length;

  useEffect(() => {
    if (query === "") {
      timeoutRef.current = setTimeout(() => {
        setPlaceholderVisible(true);
      }, 5000);
    }
  }, [query]);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (placeholderVisible) {
      timeoutRef.current = setTimeout(() => {
        setPlaceholderIndex(nextIndex);
      }, 5000);
    }
  }, [placeholderVisible, placeholderIndex]);

  return (
    <div className={classes.Input}>
      <span className={join(classes.InputPlaceholders, query !== "" ? classes.hidden : "")}>
        <AnimatePresence mode="wait">
          {placeholders.map(
            (placeholder, i) =>
              i === placeholderIndex && (
                <motion.span
                  key={placeholder}
                  initial={{ y: "1em" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-1em" }}
                  transition={{
                    type: "tween",
                    ease: "easeInOut",
                    duration: query === "" ? 0.4 : 0,
                  }}
                  className={classes.InputPlaceholder}
                >
                  {placeholder}
                </motion.span>
              )
          )}
        </AnimatePresence>
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
