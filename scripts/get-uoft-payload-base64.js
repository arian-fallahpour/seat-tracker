const dotenv = require("dotenv");
const convert = require("xml-js");
const path = require("path");
const UoftAdapter = require("../models/api-adapters/UoftAdapter");
const fs = require("fs");

dotenv.config({ path: "./config.env" });

(async () => {
  // const { data } = await UoftAdapter.fetchAxios(UoftAdapter.getFetchOptions());

  const html = fs.readFileSync(path.join(__dirname + "/test.html"));

  function nativeType(value) {
    var nValue = Number(value);
    if (!isNaN(nValue)) {
      return nValue;
    }
    var bValue = value.toLowerCase();
    if (bValue === "true") {
      return true;
    } else if (bValue === "false") {
      return false;
    }
    return value;
  }

  function nativeType(value) {
    var nValue = Number(value);
    if (!isNaN(nValue)) {
      return nValue;
    }
    var bValue = value.toLowerCase();
    if (bValue === "true") {
      return true;
    } else if (bValue === "false") {
      return false;
    }
    return value;
  }

  var removeJsonTextAttribute = function (value, parentElement) {
    try {
      var keyNo = Object.keys(parentElement._parent).length;
      var keyName = Object.keys(parentElement._parent)[keyNo - 1];
      parentElement._parent[keyName] = nativeType(value);
    } catch (e) {}
  };

  var options = {
    compact: true,
    trim: true,
    ignoreDeclaration: true,
    ignoreInstruction: true,
    ignoreAttributes: true,
    ignoreComment: true,
    ignoreCdata: true,
    ignoreDoctype: true,
    textFn: removeJsonTextAttribute,
  };

  const data2 = convert.xml2json(html, options);
  // console.log(data2.TTBResponse.payload.pageableCourse.courses.courses[0]);

  const payload = UoftAdapter.getBody();
  const base64 = Buffer.from(JSON.stringify(payload)).toString("base64");
  fs.writeFileSync(path.join(__dirname + "/payload.json"), data2);

  process.exit();
})();
