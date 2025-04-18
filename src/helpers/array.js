const toggleItem = (array, item) => {
  if (array.includes(item)) {
    return array.filter((arr) => arr !== item);
  } else {
    return [...array, item];
  }
};

export const arrayHelper = {
  toggleItem,
};
