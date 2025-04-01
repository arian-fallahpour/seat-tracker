import HomePage from "@/components/pages/HomePage/HomePage";
import { connectToDB } from "../utils/helper-server";
import Alert from "../models/database/Alert";
import Section from "../models/database/Section/Section";
import Log from "../models/database/Log";

const getData = async () => {
  console.log(process.env);
  // let dbUri = process.env.DATABASE_CONNECTION;
  // dbUri = dbUri.replace("<DATABASE_USER>", process.env.DATABASE_USER);
  // dbUri = dbUri.replace("<DATABASE_PASS>", process.env.DATABASE_PASS);
  // await mongoose.connect(dbUri, { autoIndex: true });

  // const alerts = await Alert.aggregate([{ $count: "count" }]);
  return {
    alertsCount: 1,
  };
};

export default async function Page() {
  const { alertsCount } = await getData();
  console.log(alertsCount);

  return <HomePage alertsCount={alertsCount} />;
}
