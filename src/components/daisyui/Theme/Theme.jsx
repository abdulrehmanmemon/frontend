import { forwardRef, useEffect, useRef, useState } from "react";

import { defaultTheme } from "../constants";
import { ThemeContext } from "./ThemeContext";
import { getThemeFromClosestAncestor } from "./utils";

const Theme = forwardRef(
  ({ children, dataTheme, onChange, className, ...props }, ref) => {
    // Either use provided ref or create a new ref
    const themeRef = useRef(ref?.current);

    const closestAncestorTheme = getThemeFromClosestAncestor(themeRef);

    // If no theme is provided, use the closest ancestor theme, if no ancestor theme, fallback to default theme (defined in constants)
    const [theme, setTheme] = useState(
      dataTheme || closestAncestorTheme || defaultTheme
    );

    const handleThemeChange = (theme) => {
      //  Fire custom onChange, if provided. Ie, user provided function to store theme in session/local storage
      onChange && onChange(theme);
      // Update state/context
      setTheme(theme);
    };

    // Properly handle changes to theme prop on a Theme component
    useEffect(() => {
      if (dataTheme !== theme) {
        dataTheme && handleThemeChange(dataTheme);
      }
    }, [dataTheme]);

    return (
      <ThemeContext.Provider value={{ theme, setTheme: handleThemeChange }}>
        <div {...props} data-theme={theme} className={className} ref={themeRef}>
          {children}
        </div>
      </ThemeContext.Provider>
    );
  }
);

Theme.displayName = "Theme";

export default Theme;
