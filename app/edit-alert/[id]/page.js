import React from "react";

import config from "@/utils/config";
import { createServerURL } from "@/utils/helper-server";
import AlertPage from "@/components/pages/AlertPage/AlertPage";
import { redirect } from "next/navigation";

const getData = async (alertId) => {
  const url = await createServerURL(`${config.API_PATH}/alerts/info/${alertId}`);
  const response = await fetch({ url, method: "GET" });
  const body = await response.json();

  if (!response.ok) {
    return null;
  }

  const { alert } = body.data;
  return alert;
};

async function Page({ params }) {
  const { id } = await params;
  const alert = await getData(id);

  if (alert === null) {
    redirect("/");
    // TODO: Add error message that we could not find the alert
  }

  return <AlertPage alert={alert} />;
}

export default Page;
