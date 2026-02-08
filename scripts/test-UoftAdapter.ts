import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import UoftAdapter from "@/utils/Uoft/UoftAdapter";

import path from "path";
import fs from "fs/promises";
import AlertModel from "@/models/AlertModel";
import { connectToDB } from "@/utils/helper-next";
import { uoftCampusValues, uoftTermValues } from "@/Types/ModelTypes";

try {
  // await connectToDB();

  // const courses = await UoftAdapter.fetch({ method: "api", season: "fall-winter" });
  // await fs.mkdir(path.join(process.cwd(), "scripts", "output"), { recursive: true });
  // await fs.writeFile(
  //   path.join(process.cwd(), "scripts", "output", `uoft-courses.json`),
  //   JSON.stringify(courses, null, 2),
  // );

  process.exit(0);
} catch (error: unknown) {
  if (error instanceof Error) {
    console.error("Error fetching courses:", error.message);
  }
  process.exit(1);
}
