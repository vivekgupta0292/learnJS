// ─────────────────────────────────────────────────────────────
//  EVENT BUBBLING & EVENT CAPTURING IN JAVASCRIPT
// ─────────────────────────────────────────────────────────────
//
//  DOM structure used in examples below:
//
//    <div id="grandparent">          ← outermost
//      <div id="parent">
//        <button id="child">Click</button>   ← innermost / target
//      </div>
//    </div>
//
// ─────────────────────────────────────────────────────────────
//  THE TWO PHASES
// ─────────────────────────────────────────────────────────────
//
//  When you click the button, the event travels in 3 stages:
//
//  1. CAPTURING phase  (top → target)
//     window → document → html → body → grandparent → parent → button
//
//  2. TARGET phase
//     The event is on the button itself.
//
//  3. BUBBLING phase   (target → top)
//     button → parent → grandparent → body → html → document → window
//
//  addEventListener(event, handler, useCapture)
//    useCapture = false (default) → listen in BUBBLING phase
//    useCapture = true            → listen in CAPTURING phase

// ─────────────────────────────────────────────────────────────
//  1. EVENT BUBBLING (default behaviour)
// ─────────────────────────────────────────────────────────────
//  After the event fires on the target it "bubbles up" through
//  every ancestor, triggering their listeners too.

const grandparent = document.getElementById("grandparent");
const parent      = document.getElementById("parent");
const child       = document.getElementById("child");

grandparent.addEventListener("click", () => console.log("Bubbling: grandparent"));
parent.addEventListener(     "click", () => console.log("Bubbling: parent"));
child.addEventListener(      "click", () => console.log("Bubbling: child (target)"));

// Click the button → console output:
//   Bubbling: child (target)
//   Bubbling: parent
//   Bubbling: grandparent

// ─────────────────────────────────────────────────────────────
//  2. EVENT CAPTURING (useCapture = true)
// ─────────────────────────────────────────────────────────────
//  The event is intercepted on the way DOWN before it reaches
//  the target.

grandparent.addEventListener("click", () => console.log("Capturing: grandparent"), true);
parent.addEventListener(     "click", () => console.log("Capturing: parent"),      true);
child.addEventListener(      "click", () => console.log("Capturing: child (target)"), true);

// Click the button → console output:
//   Capturing: grandparent
//   Capturing: parent
//   Capturing: child (target)

// ─────────────────────────────────────────────────────────────
//  3. BOTH PHASES TOGETHER
// ─────────────────────────────────────────────────────────────
//  If you mix capturing and bubbling listeners the full order is:

grandparent.addEventListener("click", () => console.log("CAPTURE grandparent"), true);
parent.addEventListener(     "click", () => console.log("CAPTURE parent"),      true);
child.addEventListener(      "click", () => console.log("CAPTURE child"),       true);

grandparent.addEventListener("click", () => console.log("BUBBLE grandparent"));
parent.addEventListener(     "click", () => console.log("BUBBLE parent"));
child.addEventListener(      "click", () => console.log("BUBBLE child"));

// Click the button → console output:
//   CAPTURE grandparent   ← capturing phase (top → target)
//   CAPTURE parent
//   CAPTURE child
//   BUBBLE  child         ← bubbling phase  (target → top)
//   BUBBLE  parent
//   BUBBLE  grandparent

// ─────────────────────────────────────────────────────────────
//  4. STOPPING PROPAGATION
// ─────────────────────────────────────────────────────────────

// stopPropagation() — stops the event from travelling further
// (neither up nor down past the current listener).

parent.addEventListener("click", (e) => {
  e.stopPropagation();
  console.log("Stopped at parent — grandparent will NOT hear this click");
});

// stopImmediatePropagation() — also prevents other listeners on
// the SAME element from running.

child.addEventListener("click", (e) => {
  e.stopImmediatePropagation();
  console.log("First child listener — runs");
});

child.addEventListener("click", () => {
  console.log("Second child listener — NEVER runs");
});

// ─────────────────────────────────────────────────────────────
//  5. PRACTICAL USE-CASE — EVENT DELEGATION
// ─────────────────────────────────────────────────────────────
//  Instead of attaching a listener to every <li>, attach ONE
//  listener to the <ul> and let bubbling bring events up.

const ul = document.getElementById("myList");

ul.addEventListener("click", (e) => {
  if (e.target.tagName === "LI") {
    console.log("Clicked item:", e.target.textContent);
  }
});

// Works for items added dynamically too — no need to re-attach
// listeners when new <li> elements are inserted.

// ─────────────────────────────────────────────────────────────
//  6. DATA ATTRIBUTES
// ─────────────────────────────────────────────────────────────
//
//  data-* attributes let you embed custom data directly in HTML
//  elements without using non-standard attributes or hidden fields.
//
//  HTML syntax:
//    <button
//      id="btn"
//      data-user-id="42"
//      data-role="admin"
//      data-is-active="true">
//      Click me
//    </button>
//
//  Rules:
//  • Must start with "data-"
//  • Name after "data-" must be lowercase and can use hyphens
//  • Value is always a string in HTML

// ── Reading data attributes ───────────────────────────────────

const btn = document.getElementById("btn");

// Option 1: dataset (preferred)
//   Hyphenated names are converted to camelCase automatically.
//   data-user-id  →  dataset.userId
//   data-role     →  dataset.role

console.log(btn.dataset.userId);    // "42"
console.log(btn.dataset.role);      // "admin"
console.log(btn.dataset.isActive);  // "true"

// Option 2: getAttribute
console.log(btn.getAttribute("data-user-id")); // "42"

// ── Writing / updating data attributes ───────────────────────

btn.dataset.role = "editor";                   // update via dataset
btn.setAttribute("data-user-id", "99");        // update via setAttribute

// ── Deleting data attributes ─────────────────────────────────

delete btn.dataset.isActive;                   // removes data-is-active
btn.removeAttribute("data-role");              // removes data-role

// ── Practical example — event delegation + data attributes ───
//
//  HTML:
//    <ul id="productList">
//      <li data-id="101" data-category="shoes">Nike Air</li>
//      <li data-id="202" data-category="shirts">Polo Shirt</li>
//      <li data-id="303" data-category="shoes">Adidas Stan</li>
//    </ul>

const productList = document.getElementById("productList");

productList.addEventListener("click", (e) => {
  const li = e.target.closest("li");
  if (!li) return;

  const { id, category } = li.dataset;
  console.log(`Product ID: ${id}, Category: ${category}`);
  // Click "Nike Air"    → Product ID: 101, Category: shoes
  // Click "Polo Shirt"  → Product ID: 202, Category: shirts
});

// ── CSS styling via data attributes ──────────────────────────
//
//  You can also target data attributes in CSS:
//
//    li[data-category="shoes"] {
//      color: blue;
//    }
//
//  This keeps JS data and visual state in sync without adding
//  extra CSS classes manually.
