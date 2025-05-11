import { redirect } from "next/navigation";
import config from "@/utils/config";
import { createServerURL } from "@/utils/helper-server";

async function Page({ searchParams }) {
  const { code } = await searchParams;
  if (!code) {
    redirect(`/?error=Please provide a verification code.`);
  }

  const response = await fetch({
    url: await createServerURL(`/${config.API_PATH}/alerts/verify`),
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  const body = await response.json();

  if (!response.ok) {
    redirect(`/?error=${body.message}`);
  }

  redirect(`/?success=${body.message}`);
}
export default Page;
