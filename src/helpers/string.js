const convertToStorageUnits = (bytes) => {
  const units = [
    "bytes",
    "KiB",
    "MiB",
    "GiB",
    "TiB",
    "PiB",
    "EiB",
    "ZiB",
    "YiB",
  ];

  let l = 0;
  let n = parseInt(String(bytes), 10) || 0;

  while (n >= 1024 && ++l) {
    n = n / 1024;
  }

  return n.toFixed(n < 10 && l > 0 ? 1 : 0) + " " + units[l];
};

const convertToCurrency = (amount) => {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const snackToNormal = (text) => {
  return text.replaceAll("_", " ");
};

const convertToFixed = (number, fixed = 2) => {
  const n = number.toFixed(fixed);
  if (Math.floor(Number(n)) == number) return number.toString();
  return n;
};

export const stringHelper = {
  convertToStorageUnits,
  convertToCurrency,
  convertToFixed,
  snackToNormal,
};
