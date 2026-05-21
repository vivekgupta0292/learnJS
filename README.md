# learnJS

A topic-wise JavaScript learning repository covering core concepts with hands-on implementations.

## Topics Covered

### Functions
File: [functions.js](functions.js)

- **`call`** — invoke a function with an explicit `this` context and individual arguments
- **`apply`** — same as `call` but accepts arguments as an array
- **`bind`** — returns a new function permanently bound to a `this` context
- **Custom implementations** — `myCall`, `myApply`, and `myBind` built from scratch on `Function.prototype` to understand the internals

### Currying
File: [currying.js](currying.js)

- **What it is** — transforms a multi-argument function into a chain of single-argument functions: `add(2, 3)` → `add(2)(3)`
- **Manual currying** — nested functions and arrow function shorthand (`(a) => (b) => a * b`)
- **Partial application** — locking in early arguments to create specialised functions (e.g. `double`, `triple` from `multiply`; discount tiers from `applyDiscount`)
- **Generic `curry()` helper** — utility that auto-curries any function, accepting arguments one at a time or in batches
- **Infinite currying** — accumulates any number of values; calling with no argument `()` returns the final result (`sum(1)(2)(3)()`)

### Debouncing & Throttling
File: [debouncing.js](debouncing.js)

- **`myDebounce`** — delays function execution until a specified time has passed since the last call; useful for search inputs, resize events
- **`myThrottle`** — ensures a function runs at most once per time window regardless of how often it is called; useful for scroll handlers, rate-limiting API calls

### Event Handling
File: [eventHandling.js](eventHandling.js)

- **Event bubbling** — events fire on the target then travel up through ancestors (default behaviour)
- **Event capturing** — events are intercepted top-down before reaching the target (`useCapture = true`)
- **Both phases together** — capturing listeners run first (top → target), then bubbling listeners (target → top)
- **Stopping propagation** — `stopPropagation()` halts further travel; `stopImmediatePropagation()` also blocks other listeners on the same element
- **Event delegation** — attach one listener to a parent and use `e.target` to handle clicks on any child (works for dynamically added elements too)
- **Data attributes** — embed custom metadata in HTML with `data-*`; read via `element.dataset` (camelCase) or `getAttribute`; combine with delegation for clean, class-free state management

## Structure

Each topic lives in its own file, named by concept. Code examples are kept minimal and runnable with Node.js (except `eventHandling.js`, which targets the browser DOM).

## Running Examples

```bash
node functions.js
node currying.js
node debouncing.js
```

> `eventHandling.js` requires a browser environment — open an HTML file that includes it, or paste snippets into the browser console.

## Prerequisites

- Node.js (any modern version)
- Basic understanding of JavaScript syntax
