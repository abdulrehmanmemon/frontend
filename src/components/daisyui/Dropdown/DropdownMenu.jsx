import { cn } from "@/helpers";

const DropdownMenu = ({ dataTheme, className, ...props }) => {
  const classes = cn(
    "dropdown-content menu p-2 shadow bg-base-100 rounded-box",
    className
  );

  return (
    <ul
      {...props}
      tabIndex={0}
      data-theme={dataTheme}
      className={classes}
      role="menu"
    />
  );
};

export default DropdownMenu;
