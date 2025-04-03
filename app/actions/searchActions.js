"use server";

export async function searchCourses(query) {
  const response = await fetch({
    url: `/${config.API_PATH}/courses/search?query=${query}`,
    method: "GET",
  });
  const body = await response.json();

  if (!response.ok) {
  }
}
