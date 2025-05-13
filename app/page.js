import HomePage from "@/components/pages/HomePage/HomePage";
import { getPageHeader } from "@/utils/helper-client";

export const metadata = {
  title: getPageHeader("Waitlists for UofT courses!"),
};

export default async function Page() {
  return <HomePage />;
}
