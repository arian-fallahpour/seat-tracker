import React, { useEffect, useState } from "react";
import classes from "./GlobalSuccess.module.scss";
import CheckIcon from "../icons/CheckIcon";
import { join } from "@/utils/helper-client";
import { useQueryParams } from "@/hooks/use-query-params";

const GlobalSuccess = () => {
  const queryParams = useQueryParams();

  const [message, setMessage] = useState(null);

  useEffect(() => {
    const success = queryParams.get("success");
    if (typeof success === "string" && success.trim() !== "") {
      setMessage(success);
      queryParams.delete("success");
    }
  }, []);

  useEffect(() => {
    if (message) {
      setTimeout(() => setMessage(null), 5000);
    }
  }, [message]);

  return (
    <div className={join(classes.GlobalSuccess, message ? classes.visible : null)}>
      <CheckIcon className={classes.GlobalSucessIcon} />
      <p className="paragraph">{message}</p>
    </div>
  );
};

export default GlobalSuccess;
