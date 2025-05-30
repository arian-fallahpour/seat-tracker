import classes from "./Search.module.scss";
import SearchResult from "./SearchResult";

const SearchResults = ({ courses }) => {
  return (
    <div className={classes.Results}>
      {courses &&
        courses.length > 0 &&
        courses.map((course) => <SearchResult {...course} key={course.code} />)}
      {courses && courses.length === 0 && (
        <div className={classes.NoResults}>
          <p className="paragraph">No courses found!</p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
