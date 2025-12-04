// src/utils/text.js
export const toTitleCase = (value) => {
  if (value === null || value === undefined) return "";
  return value
    .toString()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

// New: Sentence case ("this is sentence." / "This is sentence.")
export const toSentenceCase = (value) => {
  if (value === null || value === undefined) return "";
  const str = value.toString().toLowerCase();

  // Capitalise first letter of string and first letter after . ! ?
  return str.replace(/(^\s*\w|[.!?]\s*\w)/g, (match) => match.toUpperCase());
};
