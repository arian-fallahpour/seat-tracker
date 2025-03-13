const scrape = async () => {
  const response = await fetch("https://scraper-api.smartproxy.com/v2/scrape", {
    method: "POST",
    body: JSON.stringify({
      target: "universal",
      url: "https://api.easi.utoronto.ca/ttb/getPageableCourses",
      http_method: "POST",
      payload:
        "eyJjb3Vyc2VDb2RlQW5kVGl0bGVQcm9wcyI6eyJjb3Vyc2VDb2RlIjoiIiwiY291cnNlVGl0bGUiOiIiLCJjb3Vyc2VTZWN0aW9uQ29kZSI6IiIsInNlYXJjaENvdXJzZURlc2NyaXB0aW9uIjp0cnVlfSwiZGVwYXJ0bWVudFByb3BzIjpbXSwiY2FtcHVzZXMiOltdLCJzZXNzaW9ucyI6WyIyMDI0OSIsIjIwMjUxIiwiMjAyNDktMjAyNTEiXSwicmVxdWlyZW1lbnRQcm9wcyI6W10sImluc3RydWN0b3IiOiIiLCJjb3Vyc2VMZXZlbHMiOltdLCJkZWxpdmVyeU1vZGVzIjpbXSwiZGF5UHJlZmVyZW5jZXMiOltdLCJ0aW1lUHJlZmVyZW5jZXMiOltdLCJkaXZpc2lvbnMiOlsiQVBTQyIsIkFSVFNDIiwiRklTIiwiRlBFSCIsIk1VU0lDIiwiQVJDTEEiLCJFUklOIiwiU0NBUiJdLCJjcmVkaXRXZWlnaHRzIjpbXSwiYXZhaWxhYmxlU3BhY2UiOmZhbHNlLCJ3YWl0TGlzdGFibGUiOmZhbHNlLCJwYWdlIjoxLCJwYWdlU2l6ZSI6MjAsImRpcmVjdGlvbiI6ImFzYyJ9",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      force_headers: true,
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: "",
    },
  }).catch((error) => console.log(error));

  console.log(await response.json());
};

scrape();
