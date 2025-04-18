import { forwardRef } from "react";

import { cn } from "@/helpers";

const FileInput = forwardRef(
  ({ className, size, color, bordered, dataTheme, ...props }, ref) => {
    const classes = cn("file-input", className, {
      "file-input-lg": size === "lg",
      "file-input-md": size === "md",
      "file-input-sm": size === "sm",
      "file-input-xs": size === "xs",
      "file-input-primary": color === "primary",
      "file-input-secondary": color === "secondary",
      "file-input-accent": color === "accent",
      "file-input-ghost": color === "ghost",
      "file-input-info": color === "info",
      "file-input-success": color === "success",
      "file-input-warning": color === "warning",
      "file-input-error": color === "error",
      "file-input-bordered": bordered,
    });
    return (
      <input
        {...props}
        ref={ref}
        type="file"
        data-theme={dataTheme}
        className={classes}
      />
    );
  }
);

FileInput.displayName = "FileInput";

export default FileInput;
