import { useRouter } from "next/navigation";
import Button from "../Button/Button";
import BackIcon from "@/components/elements/icons/BackIcon";
import classes from "./Page.module.scss";
import Section from "../Section/Section";

const PageHeader = ({ includeBackButton, includeHomeButton }) => {
  const router = useRouter();

  if (!includeBackButton && !includeHomeButton) {
    return null;
  }

  let button;
  if (includeBackButton) {
    button = (
      <Button variant="text" className={classes.Back} onClick={() => router.back()}>
        <BackIcon /> back
      </Button>
    );
  } else if (includeHomeButton) {
    button = (
      <Button variant="text" className={classes.Back} onClick={() => router.push("/")}>
        <BackIcon /> home
      </Button>
    );
  }

  return <Section className={classes.Header}>{button}</Section>;
};

export default PageHeader;
