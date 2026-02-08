import { HydratedDocument, Query } from "mongoose";

// TODO: NOTE: Parameter pollution protection may cause weird bugs when using arrays in query

type APIQueryType<T, TMethods> = Query<
  HydratedDocument<T, TMethods>[],
  HydratedDocument<T, TMethods>,
  {},
  T
>;

type APIOptionsType = {
  page?: number;
  sort?: string;
  limit?: number;
  select?: string;
};

const excludedFields = ["page", "sort", "limit", "select"];

class APIQuery<T, TMethods = {}> {
  query: APIQueryType<T, TMethods>;
  options: APIOptionsType;

  constructor(query: APIQueryType<T, TMethods>, options: APIOptionsType) {
    this.query = query;
    this.options = options;
  }

  filter() {
    const filteredQueryObject = { ...this.options };
    excludedFields.forEach((el) => delete filteredQueryObject[el]);

    // Add $gt, $gte, $lt, $lte operators
    let queryString = JSON.stringify(filteredQueryObject);
    queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryString));
    return this;
  }

  sort() {
    if (this.options.sort !== undefined) {
      const sortString = this.options.sort
        .split(",")
        .map((str) => str.trim()) // Trim spaces
        .join(" ");
      this.query = this.query.sort(sortString);

      return this;
    }

    this.query = this.query.sort("-createdAt");
    return this;
  }

  select() {
    if (this.options.select !== undefined) {
      const fields = this.options.select.split(",").join(" ");
      this.query = this.query.select(fields) as unknown as APIQueryType<T, TMethods>;

      return this;
    }

    this.query = this.query.select("-__v") as unknown as APIQueryType<T, TMethods>;
    return this;
  }

  paginate() {
    const page = this.options.page * 1 || 1;
    const limit = Math.min(this.options.limit * 1 || 10, 50);
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  async execute() {
    return await this.query;
  }
}

export default APIQuery;
