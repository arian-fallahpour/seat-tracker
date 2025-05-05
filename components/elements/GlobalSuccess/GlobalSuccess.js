import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import classes from "./GlobalSuccess.module.scss";
import CheckIcon from "../icons/CheckIcon";
import { join, removeParam } from "@/utils/helper-client";

const GlobalSuccess = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [message, setMessage] = useState(null);

  useEffect(() => {
    const success = searchParams.get("success");
    if (typeof success === "string" && success.trim() !== "") {
      setMessage(success);
      removeParam(searchParams, router, "success");
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
