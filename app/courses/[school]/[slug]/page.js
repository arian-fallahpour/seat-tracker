import React from "react";

import CoursePage from "@/components/pages/CoursePage/CoursePage";
import config from "@/utils/config";
import { createServerURL } from "../../../../utils/helper-server";

const getData = async (school, slug) => {
  const url = await createServerURL(`${config.API_PATH}/courses/info/${school}/${slug}`);
  const response = await fetch({ url, method: "GET" });

  if (!response.ok) {
    throw new Error("Could not get course data.");
  }

  const body = await response.json();
  const { course } = body.data;
  return course;
};

async function Page({ params }) {
  const { school, slug } = await params;
  const course = await getData(school, slug);

  return <CoursePage course={course} />;
}

export default Page;
