# Welgo

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![Build Status](https://travis-ci.org/Bloomca/welgo.svg?branch=master)](https://travis-ci.org/Bloomca/welgo)

> This is a WIP, and not ready yet. However, the whole project is more like a research, so feel free to ask question or suggest new features

Server-side framework for rendering mostly static websites – it is _not_ suitable for applications.

- Zero runtime
- no VDOM
- React-inspired components

## How does it work?

It is a server-side framework, so you need to create components using it, and then render the whole page using top-level component.

## Rationale

> After releasing this library I'll move this to the separate blog post

This is intended to be a server-side framework for client-side code. What does it mean?

Modern frontend is very complicated, and while it allows to create very advanced applications, sometimes we end up having purely static websites, written in client-side frameworks, like React.js or Vue. It leads to several problems:
- longer startup time
- if there is no pre-rendering, no SEO
- more traffic for downloading script files
- more JS to parse and execute

To summarize, the biggest problem is that we have to ship runtime, which will execute our code and render our application (again, we are talking about mostly static websites) – [see this tweet from netflix](https://mobile.twitter.com/NetflixUIE/status/923374215041912833).

However, there are reasons why people prefer them:
- components
- composition of components

There are other reasons, but these are from my point of view are the strongest – they allow to move from old template systems, and render markup in much more clear way.

This framework intends to keep these benefits, while doing all the work only on the server-side, and ship zero runtime 

## License

MIT