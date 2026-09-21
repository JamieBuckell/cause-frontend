export const requiredPathParam = (value, name) => {
  if (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "")
  ) {
    throw new TypeError(`Missing required API path parameter: ${name}`);
  }

  return encodeURIComponent(String(value));
};

