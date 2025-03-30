import React, { useMemo } from "react";
import classes from "./Search.module.scss";
import Link from "next/link";
import { join } from "@/utils/helper-client";

const SearchResult = ({ code, name, term, slug, sections }) => {
  const [labs, tutorials] = useMemo(() => {
    let labs = 0;
    let tutorials = 0;
    for (const section of sections) {
      if (section.type === "lab") {
        labs++;
      } else if (section.type === "tutorial") {
        tutorials++;
      }
    }

    return [labs, tutorials];
  }, [code]);

  return (
    <Link className={classes.Result} href={`/courses/${slug}`}>
      <div className={classes.ResultHeader}>
        <h2 className={join("header", "header-card", classes.ResultCode)}>{code}</h2>
        {labs > 0 && (
          <div className={classes.ResultLabs}>
            {labs} lab{labs > 1 ? "s" : ""}
          </div>
        )}
        {tutorials > 0 && (
          <div className={classes.ResultTutorials}>
            {tutorials} tutorial{tutorials > 1 ? "s" : ""}
          </div>
        )}
      </div>
      <div className={classes.ResultName}>{name}</div>
      <div className={classes.ResultTerm}>
        {term.season} {term.year}
      </div>
    </Link>
  );
};

export default SearchResult;
