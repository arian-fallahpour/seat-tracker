import HomePage from "@/components/pages/HomePage/HomePage";
import config from "@/utils/config";
import { createServerURL } from "@/utils/helper-server";

const getData = async () => {
  const url = await createServerURL(`${config.API_PATH}/alerts/count`);
  const response = await fetch({ url, method: "GET" }, { next: { revalidate: 1 } });

  if (!response.ok) {
    throw new Error("Could not get course data.");
  }

  const body = await response.json();
  const { count } = body.data;
  return { alertsCount: count };
};

export default async function Page() {
  const { alertsCount } = await getData();

  return <HomePage alertsCount={alertsCount} />;
}
