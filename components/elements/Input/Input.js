import classes from "./Input.module.scss";
import { join } from "@/utils/helper-client";

const Input = ({ label, placeholder, type, value, id, name, error, className, ...otherProps }) => {
  return (
    <div className={join(classes.Input, className)} {...otherProps}>
      <label htmlFor={name}>{label}</label>
      <input type={type} id={id} name={name} value={value} placeholder={placeholder} />
      {error && <div className={classes.InputError}>{error}</div>}
    </div>
  );
};

export default Input;
