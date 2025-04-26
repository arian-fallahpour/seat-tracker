import React, { useMemo } from "react";
import classes from "./Search.module.scss";
import Link from "next/link";
import { join } from "@/utils/helper-client";

const SearchResult = ({ code, name, term, slug, sections }) => {
  const counts = useMemo(() => {
    const counts = {};
    for (const section of sections) {
      if (!counts[section.type]) {
        counts[section.type] = 0;
      }

      counts[section.type]++;
    }

    return counts;
  }, [code]);

  return (
    <Link className={classes.Result} href={`/courses/${slug}`}>
      <div className={classes.ResultHeader}>
        <h2 className={join("header", "header-card", classes.ResultCode)}>{code}</h2>
        {Object.keys(counts).map((key) => (
          <div className={classes.ResultLabs} key={key}>
            {counts[key]} {key}
            {counts[key] > 1 ? "s" : ""}
          </div>
        ))}
      </div>
      <div className={classes.ResultName}>{name}</div>
      <div className={classes.ResultTerm}>
        {term.name} {term.year}
      </div>
    </Link>
  );
};

export default SearchResult;
