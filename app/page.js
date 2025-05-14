import HomePage from "@/components/pages/HomePage/HomePage";
import { getPageHeader } from "@/utils/helper-client";

export const metadata = {
  title: getPageHeader("Alerts for UofT courses that are full!"),
};

export default async function Page() {
  return <HomePage />;
}
