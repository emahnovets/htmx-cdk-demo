---
author: Evgeny Mahnovets
---

# HTMX overview: what it is and why we might need it

---

# What is HTMX?

HTMX is a JavaScript library that allows you to access AJAX, WebSockets, and Server-Sent Events directly in HTML.

---

# Why do we need HTMX?

- **Simplicity**: HTMX allows you to create dynamic web applications without writing a single line of JavaScript.
- **Performance**: HTMX is designed to be fast and lightweight.
- **Flexibility**: HTMX is designed to be flexible and extensible.
- **Compatibility**: HTMX is designed to work with all modern browsers.

---

# How does HTMX work?

HTMX works by adding attributes to your HTML elements that tell HTMX how to interact with the server.

```html
<button
  hx-get="/api/click"
  hx-trigger="click"
  hx-target="#parent-div"
  hx-swap="outerHTML"
>
  Click
</button>
```

---

# HTMX Demo

* [todos.em-dev.org](https://todos.em-dev.org)
* [github.com/emahnovets/htmx-cdk-demo](https://github.com/emahnovets/htmx-cdk-demo)

---

# Pros and Cons of HTMX

## Pros

TODO

## Cons

TODO

---

# Conclusion

HTMX is a powerful tool that allows you to create dynamic web applications without writing a single line of JavaScript.

---

# Questions?

Links:
- [HTMX](https://htmx.org/)
- [Demo App](https://todos.em-dev.org)
- [Demo App Github](https://github.com/emahnovets/htmx-cdk-demo)
