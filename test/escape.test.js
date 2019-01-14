/**
 * @jest-environment node
 */

const escapeHTML = require("../src/escape");

let escaped = "&amp&lt&gt&quot&#39/";
let unescaped = "&<>\"'/";

escaped += escaped;
unescaped += unescaped;

test("should escape values", () => {
  expect(escapeHTML(unescaped)).toBe(escaped);
});

test("should handle strings with nothing to escape", () => {
  expect(escapeHTML("abc")).toBe("abc");
});

test("should not escape the / character", () => {
  expect(escapeHTML("/")).toBe("/");
});

test("should not escape the ` character", () => {
  expect(escapeHTML("`")).toBe("`");
});
