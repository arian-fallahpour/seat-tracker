import React, { Fragment } from "react";
import Nav from "../Nav/Nav";
import Footer from "../Footer/Footer";
import { join } from "@/utils/helper";

const Page = ({ className, children, ...otherProps }) => {
  return (
    <Fragment>
      <Nav />
      <main className={join("main", className)} {...otherProps}>
        {children}
      </main>
      <Footer />
    </Fragment>
  );
};

export default Page;
