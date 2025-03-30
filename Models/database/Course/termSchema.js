import mongoose from "mongoose";
import enums from "../../../data/enums.js";

const termSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: [true, "Please provide a year for the course term."],
    min: [2000, "Course term year must be greater than 2000"],
  },
  season: {
    type: String,
    required: [true, "Please provide the season for the course term."],
    enum: {
      values: enums.term.season,
      message: "Please provide a valid season for the course term.",
    },
  },
});

export default termSchema;
