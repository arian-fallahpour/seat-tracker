import { Poppins } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";

import "@/sass/globals.scss";
import { getPageHeader, join } from "@/utils/helper-client";

export const metadata = {
  title: getPageHeader(),
  description: "Create alerts for courses that don't have waitlists!",
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <GoogleAnalytics gaId="G-XJGNBKQJ1P" />
      <body className={join(poppins.className)}>{children}</body>
    </html>
  );
}
