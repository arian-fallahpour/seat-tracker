import HomePage from "@/components/pages/HomePage/HomePage";
import { getPageHeader } from "@/utils/helper-client";

export const metadata = {
  title: getPageHeader("Create waitlisted alerts for your courses!"),
};

export default async function Page() {
  return <HomePage />;
}
