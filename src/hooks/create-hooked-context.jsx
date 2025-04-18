import { createContext, useContext } from "react";

const createHookedContext = (fn) => {
  const Context = createContext({});

  const ContextProvider = ({ children, ...other }) => {
    // @ts-ignore
    return <Context.Provider value={fn(other)}>{children}</Context.Provider>;
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const hook = () => useContext(Context);

  return [hook, ContextProvider];
};

export { createHookedContext };
