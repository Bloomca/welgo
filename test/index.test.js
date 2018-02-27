const { createElement: h, createWelgoClass, render } = require("../src/index");

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

test("renders welgo class correctly", async () => {
  const El = createWelgoClass({
    render() {
      return h("div", {}, "something");
    }
  });

  const compiled = await render(h(El));

  expect(compiled).toBe("<div>something</div>");
});

test("renders nested welgo classes correctly", async () => {
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

  const compiled = await render(h(El2));

  expect(compiled).toBe(
    "<div>second component<div>first component</div></div>"
  );
});
