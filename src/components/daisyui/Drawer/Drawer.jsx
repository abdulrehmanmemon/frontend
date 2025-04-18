import { cn } from "@/helpers";

const Drawer = ({
  children,
  side,
  open,
  end,
  dataTheme,
  className,
  toggleClassName,
  contentClassName,
  sideClassName,
  overlayClassName,
  onClickOverlay,
  ...props
}) => {
  const classes = cn("drawer", className, {
    "drawer-end": end,
  });

  return (
    <div
      // aria-expanded={open}
      {...props}
      data-theme={dataTheme}
      className={classes}
    >
      <input
        aria-label="Drawer handler"
        type="checkbox"
        className={cn("drawer-toggle", toggleClassName)}
        checked={open}
        readOnly
      />
      <div className={cn("drawer-content", contentClassName)}>{children}</div>
      <div className={cn("drawer-side", sideClassName)}>
        <label
          className={cn("drawer-overlay", overlayClassName)}
          onClick={onClickOverlay}
        ></label>
        {side}
      </div>
    </div>
  );
};

export default Drawer;
