import FAQPage from "../../components/pages/FAQPage/FAQPage";
import { getPageHeader } from "../../utils/helper-client";

export const metadata = {
  title: getPageHeader("FAQ"),
};

async function Page() {
  return <FAQPage />;
}

export default Page;
