import { useEffect, useMemo } from "react";

import { useTheme as daisyUseTheme } from "@/components/daisyui";

import { createHookedContext } from "@/hooks/create-hooked-context";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { getDynamicColors } from "@/lib/theme";

const defaultState = {
  theme: {
    mode: "light",
    primary: "default",
  },
};

export const useHook = () => {
  const { setTheme } = daisyUseTheme();

  const [state, setState] = useLocalStorage(
    "__NEXUS__GLOBAL__STORE__",
    defaultState
  );

  const updateState = (changes) => {
    setState((state) => {
      return { ...state, ...changes };
    });
  };

  const isDark = useMemo(() => state.theme.mode === "dark", [state.theme.mode]);

  const htmlRef = useMemo(() => {
    return typeof window !== "undefined" && document.querySelector("html");
  }, []);

  const primaryColor = useMemo(
    () => getDynamicColors[state.theme.primary],
    [state.theme.primary]
  );

  useEffect(() => {
    setTheme(state.theme.mode);
    if (htmlRef) {
      if (state.theme.mode == "dark") {
        htmlRef.classList.add("dark");
      } else {
        htmlRef.classList.remove("dark");
      }
    }
  }, [state.theme.mode, htmlRef]);

  // useLayoutEffect(() => {
  //     domHelper.changePrimaryColor(state.theme.primary);
  // }, [state.theme.primary]);

  const changeThemeMode = (themeMode) => {
    updateState({
      theme: {
        ...state.theme,
        mode: themeMode,
      },
    });
  };

  return {
    state,
    isDark,
    primaryColor,
    changeThemeMode,
  };
};

const [useGlobalContext, GlobalContextProvider] = createHookedContext(useHook);

export { useGlobalContext, GlobalContextProvider };
