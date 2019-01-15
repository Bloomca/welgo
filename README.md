# Welgo

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![Build Status](https://travis-ci.org/Bloomca/welgo.svg?branch=master)](https://travis-ci.org/Bloomca/welgo)

Server-side library with react-like components (JSX supported), which is supposed to be used instead of traditional templating language, like Jade/Pug, Handlebars, etc.

- Zero dependencies
- React-inspired components
- Async components (fetch data where you need it)

## Getting started

```js
const Welgo = require("welgo");
const htm = require("htm");

const html = htm.bind(Welgo.createElement);

const express = require("express");

const app = express();

async function Page(props, { getTopics }) {
  // you can call async functions inside components
  const topics = await getTopics();

  return html`
    <ul>
      ${topics.map(
          topic => html`
            <li><${Topic} ...${topic} /></li>
          `)}
    </ul>
  `;
}

function Topic({ title, description }) {
  return html`
    <${Welgo.Fragment}>
      <h3>${title}</h3>
      <p>${description}</p>
    <//>
  `;
}

app.get("*", async (req, res) => {
  const page = await Welgo.render(
    html`<${Page} />`,
    {
      getTopics: () => {
        return new Promise(resolve =>
          setTimeout(resolve, 100, [
            { title: "some title", description: "some description" }
          ])
        );
      }
    }
  );
  res.send(page);
});

app.listen(3000, () => console.log('I am up and running at port 3000!'));
```

I used library [htm](https://github.com/developit/htm), which is especially nifty since you don't need to transpile your code (we don't do it very often in Node.js codebase). However, you can use both `Welgo.createElement()` and JSX setup, if it works better for you.

## Installation

`welgo` is published on npm, you will need to save it into your dependencies:

```sh
npm i --save welgo
```

You'll need to use Node 9+ in order to use it. If you want to use it on the client-side, you can do, but keep in mind that source code is not transpiled to ES5.

## API

If you are familiar with [React](https://reactjs.org/docs/getting-started.html), then you know pretty much all of it. Since there is no lifecycle on the server, all components are _functions only_, with two parameters:

- passed properties
- resolvers

Second parameter, named `resolvers` is data which was passed at the root of the rendering. You can treat it as a context, and keep in mind that after we render the page, you still can use this data to do something before sending the reply (e.g. tweak the metadata).

Another big difference is that all components are asynchronous by default, so you can easily do the following:

```js
async function Movie(props, { getMovie }) {
  const movie = await getMovie(props.id);
}
```

To render your page, you should use `render` function, which is asynchronous by default as well (since any component can be asynchronous):

```js
const { render, createElement } from 'welgo';

async function handle(req, res) {
  const page = await render(createElement(Page), {
    query: req.query,
    user: {
      id: 'qw21cgl'
    },
    getMovie: ...
  });

  res.send(page);
}
```

The whole API is:

- createElement
- render
- Fragment

## Caveats

There are several caveats to be aware of:

- you can use both `class` and `className` properties, they work the same
- you can pass a string to the `style` property
- if you pass an object to the `style` property, you have to use hyphen-case, **not camelCase**!

## Limitations

Components have no lifecycle hooks: there is no real "life" on the server, we get a request, form a reply and send it to the user, done. If you want to do anything on the client-side, you should do it in your JavaScript files using query selectors in the browser. This library has zero runtime and it is designed to be so.

## Babel configuration

If you want to use this library with Babel, the main trick here is to set up a custom pragma in [react preset](https://babeljs.io/docs/en/babel-preset-react):

```js
{
  presets: [
    [
      "@babel/preset-react",
      {
        pragma: "Welgo.createElement",
        pragmaFrag: "Welgo.Fragment"
      }
    ]
  ]
}
```

## Rationale

Recently client-side frameworks achieved a lot, namely components became a standard approach. One of the biggest advantage is composition, so that we can move our components around our app without big pain.

On the server, though, we usually have a lot of templates, and after some time it becomes extremely fragile to move partials around. The biggest problem is that templates have no idea about data, so we need to pass from the top-level, and therefore it is hard to explain after some time, do we need to fetch all this data in order to render this exact view?

This approach makes all templates functions, which are asynchronous by default, and you can fetch data in them before rendering. Also, all components can share the same data which can be injected at the top level, so you don't have to pass the data all the way down manually.

## License

MIT
