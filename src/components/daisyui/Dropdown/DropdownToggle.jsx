import { Button } from "../Button";

const DropdownToggle = ({
  children,
  color,
  size,
  button = true,
  dataTheme,
  className,
  disabled,
  ...props
}) => {
  return (
    <label tabIndex={0} className={className} {...props}>
      {button ? (
        <Button
          type="button"
          dataTheme={dataTheme}
          color={color}
          size={size}
          disabled={disabled}
        >
          {children}
        </Button>
      ) : (
        children
      )}
    </label>
  );
};

export default DropdownToggle;
