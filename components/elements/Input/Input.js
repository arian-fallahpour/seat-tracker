import classes from "./Input.module.scss";
import { join } from "@/utils/helper-client";

const Input = ({
  className,
  value,
  label,
  type = "text",
  id,
  name,
  placeholder,
  ...otherProps
}) => {
  return (
    <div className={join(classes.Input, className)}>
      <label htmlFor={id}>{label}</label>
      <input
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        {...otherProps}
      />
    </div>
  );
};

export default Input;
