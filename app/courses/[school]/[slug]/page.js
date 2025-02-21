import React from "react";

import CoursePage from "@/components/pages/CoursePage/CoursePage";
import { config } from "@/utils/config";
import { createURL } from "@/utils/helper";

const getData = async (school, slug) => {
  const url = await createURL(`/${config.apiPath}/courses/info/${school}/${slug}`);
  const response = await fetch({ url, method: "GET" });

  if (!response.ok) {
    return;
  }

  const data = await response.json();
  const { course } = data.data;
  return course;
};

async function Page({ query, params }) {
  const { school, slug } = await params;
  const course = await getData(school, slug);

  return <CoursePage course={course} />;
}

export default Page;
