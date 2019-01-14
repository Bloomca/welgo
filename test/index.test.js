/**
 * @jest-environment node
 */

const { createElement: h, render, Fragment } = require("../src/index");

test("renders without any children correctly", async () => {
  const compiled = h("div", {});

  expect(await render(h(compiled.nodeName, compiled.props))).toBe(
    "<div></div>"
  );
});

test("renders one string child correctly", async () => {
  const compiled = await render(h("div", {}, "something"));

  expect(compiled).toBe("<div>something</div>");
});

test("renders several string children correctly", async () => {
  const compiled = await render(
    h("div", {}, "something", "another", "and the last one")
  );

  expect(compiled).toBe("<div>somethinganotherand the last one</div>");
});

test("renders nested elements correctly", async () => {
  const compiled = await render(h("div", {}, h("a", {}, "link text")));

  expect(compiled).toBe("<div><a>link text</a></div>");
});

test("renders several nested elements correctly", async () => {
  const compiled = await render(
    h(
      "div",
      {},
      h("a", {}, "link text"),
      "something",
      h("section", {}, "section text")
    )
  );

  expect(compiled).toBe(
    "<div><a>link text</a>something<section>section text</section></div>"
  );
});

test("renders a welgo component correctly", async () => {
  const El = function Component() {
    return h("div", {}, "something");
  };

  const compiled = await render(h(El));

  expect(compiled).toBe("<div>something</div>");
});

test("renders nested welgo components correctly", async () => {
  const El1 = function Component1() {
    return h("div", {}, "first component");
  };

  const El2 = function Component2() {
    return h("div", {}, "second component", h(El1));
  };

  const compiled = await render(h(El2));

  expect(compiled).toBe(
    "<div>second component<div>first component</div></div>"
  );
});

test("renders async functions correctly", async () => {
  const El = async function Component() {
    const { string } = await new Promise(resolve => {
      setTimeout(() => resolve({ string: "some" }), 100);
    });

    return h("div", {}, string);
  };

  const compiled = await render(h(El));

  expect(compiled).toBe("<div>some</div>");
});

test("passed resolver data correctly", async () => {
  const El = function Component(props, { string }) {
    return h("div", {}, string);
  };

  const compiled = await render(h(El), { string: "my string" });

  expect(compiled).toBe("<div>my string</div>");
});

test("renders style as a string correctly", async () => {
  const El = function Component() {
    return h("div", { style: "color: red" }, "some");
  };

  const compiled = await render(h(El));

  expect(compiled).toBe('<div style="color: red">some</div>');
});

test("renders style as an object", async () => {
  const El = function Component() {
    return h("div", { style: { color: "red" } }, "some");
  };

  const compiled = await render(h(El));

  expect(compiled).toBe('<div style="color:red;">some</div>');
});

test("does not render style at all in case of no properties", async () => {
  const El = function Component() {
    return h("div", { style: { color: null } }, "some");
  };

  const compiled = await render(h(El));

  expect(compiled).toBe("<div>some</div>");
});

test("Welgo.Fragment works correctly", async () => {
  const El = function Component() {
    return h(Fragment, {}, h("div", {}, "some"), h("span", {}, "another"));
  };

  const compiled = await render(h(El));

  expect(compiled).toBe("<div>some</div><span>another</span>");
});

test("properties with false value should not be in the DOM", async () => {
  const El = function Component() {
    return h("div", { disabled: false }, "title");
  };

  const compiled = await render(h(El));

  expect(compiled).toBe("<div>title</div>");
});

test("properties with true value should have only attribute", async () => {
  const El = function Component() {
    return h("div", { disabled: true }, "title");
  };

  const compiled = await render(h(El));

  expect(compiled).toBe("<div disabled>title</div>");
});
