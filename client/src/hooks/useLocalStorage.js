import { useEffect, useState } from "react";

const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    try {
      const savedValue = localStorage.getItem(key);

      if (savedValue !== null) {
        return JSON.parse(savedValue);
      }

      return initialValue;
    } catch (error) {
      console.error("Error reading localStorage:", error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error saving localStorage:", error);
    }
  }, [key, value]);

  return [value, setValue];
};

export default useLocalStorage;