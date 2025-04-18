import { useState } from "react";

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      let item = null;
      if (key) {
        item = window.localStorage.getItem(key);
      }
      return item ? { ...initialValue, ...JSON.parse(item) } : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (key) {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };
  return [storedValue, setValue];
};

export { useLocalStorage };
