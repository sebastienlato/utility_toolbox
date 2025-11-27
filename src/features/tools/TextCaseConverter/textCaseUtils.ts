const capitalize = (word: string) =>
  word.length === 0 ? "" : word[0].toUpperCase() + word.slice(1).toLowerCase();

export const normalizeWhitespace = (text: string) =>
  text.replace(/\s+/g, " ").trim();

export const toUpperCase = (text: string) => text.toUpperCase();

export const toLowerCase = (text: string) => text.toLowerCase();

export const toTitleCase = (text: string) =>
  normalizeWhitespace(text)
    .split(" ")
    .map((word) => capitalize(word))
    .join(" ");

export const toSentenceCase = (text: string) => {
  const normalized = normalizeWhitespace(text);
  if (!normalized) return "";

  const sentences = normalized
    .split(/([.!?]+\s*)/g)
    .filter((segment) => segment.length > 0);

  return sentences
    .map((segment, index) => {
      if (index % 2 === 1) {
        return segment;
      }
      const trimmed = segment.trim();
      if (!trimmed) return "";
      return capitalize(trimmed);
    })
    .join("")
    .trim();
};

export const toSnakeCase = (text: string) =>
  normalizeWhitespace(text)
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "_");

export const toKebabCase = (text: string) =>
  normalizeWhitespace(text)
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "-");

export const toCamelCase = (text: string) => {
  const words = normalizeWhitespace(text)
    .toLowerCase()
    .split(" ")
    .map((word) => word.replace(/[^\w]/g, ""));
  if (!words.length) return "";
  return (
    words[0] +
    words
      .slice(1)
      .map((word) => capitalize(word))
      .join("")
  );
};

export const toPascalCase = (text: string) =>
  normalizeWhitespace(text)
    .toLowerCase()
    .split(" ")
    .map((word) => word.replace(/[^\w]/g, ""))
    .map((word) => capitalize(word))
    .join("");

export type CaseMode =
  | "upper"
  | "lower"
  | "title"
  | "sentence"
  | "snake"
  | "kebab"
  | "camel"
  | "pascal";
