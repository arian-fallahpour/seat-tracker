import classes from "./GlobalError.module.scss";
import ErrorIcon from "../icons/ErrorIcon";
import { join } from "@/utils/helper-client";
import CloseIcon from "../icons/CloseIcon";
import Button from "../Button/Button";
import { motion } from "motion/react";

const Error = ({ className, message, index, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 + index * 7.5, filter: "blur(5px)", scale: 1 - 0.05 * index }}
      animate={{
        opacity: 1,
        y: index * 7.5,
        filter: "blur(0px)",
        zIndex: 3 - index,
        scale: 1 - 0.05 * index,
      }}
      exit={{ opacity: 0, y: -10 + index * 7.5, filter: "blur(5px)" }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={join(className, classes.GlobalError)}
    >
      <ErrorIcon className={classes.GlobalErrorIcon} />
      <p className={join("paragraph", classes.GlobalErrorMessage)}>{message}</p>
      <Button variant="icon" className={classes.GlobalErrorClose} onClick={() => onClose()}>
        <CloseIcon />
      </Button>
    </motion.div>
  );
};

export default Error;
