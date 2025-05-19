"use client";

import React, { useEffect, useState } from "react";
import { useQueryParams } from "@/hooks/use-query-params";
import { join } from "../../../../utils/helper-client";
import classes from "./VerifyAlertSection.module.scss";

import Section from "@/components/elements/Section/Section";
import Loader from "@/components/elements/Loader/Loader";
import ErrorIcon from "../../../elements/icons/ErrorIcon";
import SuccessIcon from "../../../elements/icons/SuccessIcon";
import config from "@/utils/config";

const VerifyAlertSection = () => {
  const queryParams = useQueryParams();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const verifyAlert = async () => {
      const code = queryParams.get("code");
      queryParams.delete("code");

      if (!code) {
        return setError("Verification code is missing.");
      }

      const response = await fetch(`/${config.API_PATH}/alerts/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const body = await response.json();

      if (!response.ok) {
        return setError(body.message);
      }

      setSuccess(body.message);
    };

    verifyAlert().then(() => setIsLoading(false));
  }, []);

  return (
    <Section className={classes.VerifyAlertSection}>
      <div className={classes.Card}>
        <div className={join(classes.CardContent, isLoading ? classes.active : null)}>
          <div className={classes.CardHeader}>
            <Loader className={join(classes.CardIcon, classes.Loader)} />
          </div>
          <div className={classes.CardText}>
            <h1 className="header-section">Verifying</h1>
            <p className="paragraph">Please wait while we verify your alert.</p>
          </div>
        </div>

        <div className={join(classes.CardContent, error ? classes.active : null)}>
          <div className={classes.CardHeader}>
            <ErrorIcon className={join(classes.CardIcon, classes.Error)} />
          </div>
          <div className={classes.CardText}>
            <h1 className="header-section">Verification Failed</h1>
            <p className="paragraph">{error}</p>
          </div>
        </div>

        <div className={join(classes.CardContent, success ? classes.active : null)}>
          <div className={classes.CardHeader}>
            <SuccessIcon className={join(classes.CardIcon, classes.Success)} />
          </div>
          <div className={classes.CardText}>
            <h1 className="header-section">Verified</h1>
            <p className="paragraph">{success}</p>
            <p className="paragraph">You can safely close this page!</p>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default VerifyAlertSection;
