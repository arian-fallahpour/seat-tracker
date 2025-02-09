const excludedFields = [
  "page",
  "sort",
  "limit",
  "select",
  "search",
  "populate",
];

const defaultPageLength = 10;
const maxPageLength = 50;

// NOTE: Parameter pollution protection may cause weird bugs when using arrays in query

class APIQuery {
  constructor(query, queryObject) {
    this.query = query;
    this.queryObject = queryObject;
  }

  /**
   * Filters query results based on query object
   *
   * @returns this
   */
  filter() {
    const filteredQueryObject = { ...this.queryObject };
    excludedFields.forEach((el) => delete filteredQueryObject[el]);

    // Add $gt, $gte, $lt, $lte operators
    let queryString = JSON.stringify(filteredQueryObject);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    // Update mongoose query
    this.query = this.query.find(JSON.parse(queryString));

    return this;
  }

  /**
   * Sorts query results based on query object's sort property
   *
   * @returns this
   */
  sort() {
    // Sort by the query
    if (!!this.queryObject.sort) {
      let sortString = this.queryObject.sort.split(",");
      sortString = sortString.map((str) => str.trim()); // Remove extra spaces
      sortString = sortString.join(" ");

      this.query = this.query.sort(sortString);
    }

    // Otherwise sort by creation date
    else {
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  /**
   * Selects only the fields indicated in the query object's select property
   *
   * @returns this
   */
  select() {
    // Limit by query
    if (!!this.queryObject.select) {
      const fields = this.queryObject.select.split(",").join(" ");
      this.query = this.query.select(fields);
    }

    // Limit by version?
    else {
      this.query = this.query.select("-__v");
    }

    return this;
  }

  /**
   * Paginates query results
   *
   * @returns this
   */
  paginate() {
    const page = this.queryObject.page * 1 || 1;
    const limit = Math.min(
      this.queryObject.limit * 1 || defaultPageLength,
      maxPageLength
    );
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }

  /**
   * Executes query to retrieve results
   *
   * @returns mongoose query results
   */
  async execute() {
    return await this.query;
  }
}

export default APIQuery;
