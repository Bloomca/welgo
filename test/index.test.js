const { createElement: h, createWelgoClass, render } = require("../src/index");

test("renders without any children correctly", () => {
  const compiled = h("div", {});

  expect(render(compiled.nodeName, compiled.props)).toBe("<div></div>");
});

test("renders one string child correctly", () => {
  const compiled = render("div", {}, "something");

  expect(compiled).toBe("<div>something</div>");
});

test("renders several string children correctly", () => {
  const compiled = render(
    "div",
    {},
    "something",
    "another",
    "and the last one"
  );

  expect(compiled).toBe("<div>somethinganotherand the last one</div>");
});

test("renders nested elements correctly", () => {
  const compiled = render("div", {}, h("a", {}, "link text"));

  expect(compiled).toBe("<div><a>link text</a></div>");
});

test("renders several nested elements correctly", () => {
  const compiled = render(
    "div",
    {},
    h("a", {}, "link text"),
    "something",
    h("section", {}, "section text")
  );

  expect(compiled).toBe(
    "<div><a>link text</a>something<section>section text</section></div>"
  );
});

test("renders welgo class correctly", () => {
  const El = createWelgoClass({
    render() {
      return h("div", {}, "something");
    }
  });

  const compiled = render(El);

  expect(compiled).toBe("<div>something</div>");
});

test("renders nested welgo classes correctly", () => {
  const El1 = createWelgoClass({
    render() {
      return h("div", {}, "first component");
    }
  });

  const El2 = createWelgoClass({
    render() {
      return h("div", {}, "second component", h(El1));
    }
  });

  const compiled = render(El2);

  expect(compiled).toBe(
    "<div>second component<div>first component</div></div>"
  );
});
