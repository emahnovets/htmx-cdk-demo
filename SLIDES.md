---
author: Evgeny Mahnovets
---

# HTMX overview: what it is and why we might need it

---

# What is HTMX?

HTMX is a JavaScript library that allows you to access AJAX, WebSockets, and Server-Sent Events directly in HTML.

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

* [todos.demo.emahnovets.dev](https://todos.demo.emahnovets.dev)
* [github.com/emahnovets/htmx-cdk-demo](https://github.com/emahnovets/htmx-cdk-demo)

---

# Pros and Cons of HTMX

## Pros

* Minimal to no custom JavaScript
* No build tools required
* SEO-friendly
* Browser support
* Progressive enhancement

## Cons

* Nerly impossible to implement complex UI patterns
* No state management
* Server-side rendering is required
* Bad developer experience

---

# Conclusion

HTMX is a powerful tool that allows you to create dynamic web applications without writing a single line of JavaScript.
Could be a good fit for simple applications with minimal interactivity.

---

# Questions?

Links:
- [HTMX](https://htmx.org/)
- [Demo App](https://todos.demo.emahnovets.dev)
- [Demo App Github](https://github.com/emahnovets/htmx-cdk-demo)
