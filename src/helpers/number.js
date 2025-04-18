const generateRandomIntegerAround = (value, maxVariation) => {
  return (
    Math.floor(Math.random() * maxVariation * 2 + 1) + (value - maxVariation)
  );
};

export const numberHelper = {
  generateRandomIntegerAround,
};
