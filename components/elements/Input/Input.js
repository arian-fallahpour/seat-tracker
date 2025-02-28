import classes from "./Input.module.scss";
import { join } from "@/utils/helper-client";

const Input = ({ className, label, type, id, name, placeholder, ...otherProps }) => {
  return (
    <div className={join(classes.Input, className)}>
      <label htmlFor={name}>{label}</label>
      <input type={type} id={id} name={name} placeholder={placeholder} {...otherProps} />
    </div>
  );
};

export default Input;
