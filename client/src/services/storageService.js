export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(
      key,
      JSON.stringify(data)
    );

    return true;
  } catch {
    return false;
  }
};

export const getFromStorage = (
  key,
  defaultValue = null
) => {
  try {
    const data = localStorage.getItem(key);

    if (!data) {
      return defaultValue;
    }

    return JSON.parse(data);
  } catch {
    return defaultValue;
  }
};

export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);

    return true;
  } catch {
    return false;
  }
};

export const clearStorage = () => {
  try {
    localStorage.clear();

    return true;
  } catch {
    return false;
  }
};