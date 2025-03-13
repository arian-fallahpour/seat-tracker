import React from "react";

import config from "@/utils/config";
import { createServerURL } from "@/utils/helper-server";
import AlertPage from "@/components/pages/AlertPage/AlertPage";

const getData = async (alertId) => {
  const url = await createServerURL(`${config.API_PATH}/alerts/info/${alertId}`);
  const response = await fetch({ url, method: "GET" });

  if (!response.ok) {
    throw new Error("Could not get course data.");
  }

  const body = await response.json();
  const { alert } = body.data;
  return alert;
};

async function Page({ params }) {
  const { id } = await params;
  const alert = await getData(id);

  return <AlertPage alert={alert} />;
}

export default Page;
