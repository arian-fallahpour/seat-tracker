"use client";

import React, { useMemo, useState } from "react";
import classes from "./Search.module.scss";
import Link from "next/link";
import { join } from "@/utils/helper-client";
import Loader from "@/components/elements/Loader/Loader";

const SearchResult = ({ code, name, term, slug, sections }) => {
  const [isLoading, setIsLoading] = useState(false);

  const onClickHandler = () => {
    setIsLoading(true);
  };

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
    <Link className={classes.Result} href={`/courses/${slug}`} onClick={onClickHandler}>
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
      <Loader className={join(classes.ResultLoader, isLoading ? classes.loading : null)} />
    </Link>
  );
};

export default SearchResult;
