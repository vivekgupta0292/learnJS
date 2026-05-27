// ============================================================
// THE `this` KEYWORD IN JAVASCRIPT — Complete Guide
// Covers: ES3/ES5 (old) → ES6+ (new) → Classes
// ============================================================

// ─────────────────────────────────────────────────────────────
// 1. WHAT IS `this`?
// ─────────────────────────────────────────────────────────────
// `this` is a special keyword whose value is determined at
// RUNTIME (not at definition time), based on HOW a function
// is called — not where it is written (except arrow functions).
//
// Rule of thumb:  "Who called the function?"
//                  That caller is usually `this`.


// ─────────────────────────────────────────────────────────────
// 2. GLOBAL CONTEXT  (ES3 / ES5 / ES6+)
// ─────────────────────────────────────────────────────────────

// In a browser, the global object is `window`.
// In Node.js, the global object is `global` (top-level `this`
// in a module is `{}` — an empty module exports object).

console.log(this); // browser → window | Node module → {}

function showGlobal() {
  console.log(this); // sloppy mode → global/window
}
showGlobal();

// Strict mode changes this: `this` becomes undefined
function showGlobalStrict() {
  "use strict";
  console.log(this); // undefined
}
showGlobalStrict();


// ─────────────────────────────────────────────────────────────
// 3. IMPLICIT BINDING  — the object to the left of the dot
// ─────────────────────────────────────────────────────────────
// When a function is called as a method of an object,
// `this` refers to that object.

const user = {
  name: "Alice",
  greet() {
    console.log(`Hello, I am ${this.name}`); // "Alice"
  },
};

user.greet(); // implicit binding: this = user

// ⚠️ Losing implicit binding — common gotcha
const detachedGreet = user.greet;
detachedGreet(); // this = global/undefined — lost the object!

// Another common trap: callbacks
setTimeout(user.greet, 100); // this = global/window (not user)


// ─────────────────────────────────────────────────────────────
// 4. EXPLICIT BINDING  — call / apply / bind  (ES3+)
// ─────────────────────────────────────────────────────────────
// Manually set `this` using call, apply, or bind.

function introduce(language, years) {
  console.log(`${this.name} codes in ${language} for ${years} yrs`);
}

const dev = { name: "Bob" };

// call  → invoke immediately, args spread
introduce.call(dev, "JavaScript", 5);

// apply → invoke immediately, args as array
introduce.apply(dev, ["TypeScript", 3]);

// bind  → returns a NEW function with `this` locked in
const boundIntro = introduce.bind(dev, "Python");
boundIntro(7); // Bob codes in Python for 7 yrs

// Partial application with bind
const boundWithLang = introduce.bind(dev, "Go");
boundWithLang(2); // defers `years` until later call


// ─────────────────────────────────────────────────────────────
// 5. NEW BINDING  — constructor functions  (ES3+)
// ─────────────────────────────────────────────────────────────
// When a function is called with `new`:
//   1. A blank object is created
//   2. `this` points to that new object
//   3. The object is returned automatically (if no explicit return)

function Person(name, age) {
  this.name = name;
  this.age = age;
  // implicitly: return this;
}

Person.prototype.sayHi = function () {
  console.log(`Hi, I'm ${this.name}, age ${this.age}`);
};

const alice = new Person("Alice", 30);
alice.sayHi(); // Hi, I'm Alice, age 30

// ⚠️ Forgetting `new` in sloppy mode pollutes global scope
// Person("Ghost", 0);  // this.name → window.name  (BAD)


// ─────────────────────────────────────────────────────────────
// 6. BINDING PRIORITY ORDER
// ─────────────────────────────────────────────────────────────
// (highest → lowest)
//  1. new binding
//  2. Explicit binding  (call / apply / bind)
//  3. Implicit binding  (obj.method())
//  4. Default binding   (bare function call → global or undefined)

function demo() {
  console.log(this.val);
}
const obj1 = { val: "obj1", demo };
const obj2 = { val: "obj2", demo };

obj1.demo();              // "obj1"  — implicit
obj1.demo.call(obj2);     // "obj2"  — explicit beats implicit
const bound = demo.bind(obj1);
new bound();              // this = new object, not obj1 — new beats bind


// ─────────────────────────────────────────────────────────────
// 7. ARROW FUNCTIONS  — Lexical `this`  (ES6+)
// ─────────────────────────────────────────────────────────────
// Arrow functions do NOT have their own `this`.
// They CAPTURE `this` from the enclosing lexical scope
// at the time of DEFINITION — it can never be changed.

const timer = {
  seconds: 0,
  startLegacy() {
    // Problem: regular function loses `this`
    setInterval(function () {
      this.seconds++; // `this` is global, NOT timer!
      console.log("legacy:", this.seconds); // NaN forever
    }, 1000);
  },
  startArrow() {
    // Fix: arrow inherits `this` from startArrow's scope = timer
    setInterval(() => {
      this.seconds++;
      console.log("arrow:", this.seconds); // 1, 2, 3 ...
    }, 1000);
  },
};

// Pre-ES6 workaround: capture `this` in a variable
const timer2 = {
  seconds: 0,
  start() {
    const self = this; // "self" / "that" pattern
    setInterval(function () {
      self.seconds++;
    }, 1000);
  },
};

// call/apply/bind have NO effect on arrow functions
const arrowFn = () => console.log(this);
arrowFn.call({ name: "ignored" }); // still captures outer `this`


// ─────────────────────────────────────────────────────────────
// 8. OBJECT METHODS + ARROW FUNCTIONS — the trap
// ─────────────────────────────────────────────────────────────

const counter = {
  count: 0,

  // ✅ Regular method — `this` is counter when called as counter.increment()
  increment() {
    this.count++;
    console.log(this.count);
  },

  // ❌ Arrow as method — `this` is NOT counter, it's the outer scope
  incrementArrow: () => {
    this.count++; // `this` = module/global here, not counter
    console.log(this.count);
  },
};

counter.increment();      // works: 1
counter.incrementArrow(); // broken: NaN (global this.count is undefined)


// ─────────────────────────────────────────────────────────────
// 9. ES6 CLASSES  — syntactic sugar over prototype + new binding
// ─────────────────────────────────────────────────────────────
// Classes are NOT a new object model — they compile down to
// prototype chains. BUT they always run in strict mode,
// so forgetting `new` throws a TypeError instead of silently
// polluting the global scope.

class Animal {
  constructor(name) {
    this.name = name; // `this` = newly created instance
  }

  speak() {
    // `this` = instance when called as animal.speak()
    console.log(`${this.name} makes a sound.`);
  }

  // Static method: `this` = the class itself, NOT an instance
  static create(name) {
    console.log(`Creating via ${this.name}`); // this.name = "Animal"
    return new this(name); // `new this` — calls the constructor
  }
}

const cat = new Animal("Cat");
cat.speak(); // Cat makes a sound.

const dog = Animal.create("Dog"); // Creating via Animal
dog.speak(); // Dog makes a sound.

// ── INHERITANCE ──────────────────────────────────────────────

class Dog extends Animal {
  constructor(name, breed) {
    super(name); // Must call super() before using `this`
    // `this` is unavailable until super() runs!
    this.breed = breed;
  }

  speak() {
    // `this` = Dog instance
    console.log(`${this.name} (${this.breed}) barks.`);
    super.speak(); // calls Animal.speak with the same `this`
  }
}

const rex = new Dog("Rex", "Labrador");
rex.speak();
// Rex (Labrador) barks.
// Rex makes a sound.


// ─────────────────────────────────────────────────────────────
// 10. CLASS FIELDS + ARROW METHODS  (ES2022 / Stage 3+)
// ─────────────────────────────────────────────────────────────
// Class field arrow functions bind `this` at construction time.
// Useful for passing methods as callbacks without .bind().

class Button {
  label = "Click me";

  // Arrow as class field: `this` is always the instance
  handleClick = () => {
    console.log(`Button "${this.label}" clicked`);
  };

  // Regular method — needs .bind() when passed as callback
  handleHover() {
    console.log(`Hovered "${this.label}"`);
  }
}

const btn = new Button();

// ✅ Safe to detach — arrow field keeps `this`
const handler = btn.handleClick;
handler(); // Button "Click me" clicked

// ❌ Detaching regular method loses `this`
const hoverHandler = btn.handleHover;
// hoverHandler(); // TypeError in strict mode

// ✅ Fix with bind
const boundHover = btn.handleHover.bind(btn);
boundHover(); // Hovered "Click me"

// ⚠️ Trade-off: arrow class fields are created per-instance
//    (not on prototype), so they cost more memory than methods.


// ─────────────────────────────────────────────────────────────
// 11. `this` IN EVENT HANDLERS  (browser DOM)
// ─────────────────────────────────────────────────────────────
//
// Regular function as listener → `this` = the DOM element
// Arrow function as listener   → `this` = outer lexical scope

/*
const button = document.querySelector("button");

button.addEventListener("click", function () {
  console.log(this); // <button> element
});

button.addEventListener("click", () => {
  console.log(this); // outer scope (window in browser scripts)
});
*/


// ─────────────────────────────────────────────────────────────
// 12. `this` IN GETTER / SETTER  (ES5+)
// ─────────────────────────────────────────────────────────────

const rectangle = {
  width: 10,
  height: 5,
  get area() {
    return this.width * this.height; // `this` = rectangle
  },
  set dimensions({ width, height }) {
    this.width = width;
    this.height = height;
  },
};

console.log(rectangle.area);           // 50
rectangle.dimensions = { width: 4, height: 3 };
console.log(rectangle.area);           // 12


// ─────────────────────────────────────────────────────────────
// 13. `this` IN PROTOTYPE CHAIN
// ─────────────────────────────────────────────────────────────
// `this` always refers to the object on which the method was
// INVOKED, not the object that OWNS the method in the chain.

function Vehicle(type) {
  this.type = type;
}

Vehicle.prototype.describe = function () {
  return `I am a ${this.type}`; // `this` = whichever instance called it
};

function Car(type, brand) {
  Vehicle.call(this, type); // steal Vehicle's constructor
  this.brand = brand;
}

Car.prototype = Object.create(Vehicle.prototype);
Car.prototype.constructor = Car;

Car.prototype.describe = function () {
  return `${Vehicle.prototype.describe.call(this)}, brand: ${this.brand}`;
};

const myCar = new Car("Sedan", "Toyota");
console.log(myCar.describe()); // I am a Sedan, brand: Toyota


// ─────────────────────────────────────────────────────────────
// 14. HARD BINDING PATTERN  (ES5 — before arrow functions)
// ─────────────────────────────────────────────────────────────
// Polyfill-style bind: ensures `this` can never be overridden

function hardBind(fn, ctx) {
  return function (...args) {
    return fn.apply(ctx, args);
  };
}

function sayName() {
  console.log(this.name);
}

const carol = { name: "Carol" };
const hardBound = hardBind(sayName, carol);
hardBound.call({ name: "override" }); // still "Carol"


// ─────────────────────────────────────────────────────────────
// 15. QUICK REFERENCE CHEAT SHEET
// ─────────────────────────────────────────────────────────────
//
//  Call pattern                    `this` value
//  ──────────────────────────────────────────────────────────
//  fn()                            global (sloppy) / undefined (strict)
//  obj.fn()                        obj
//  fn.call(ctx, ...args)           ctx
//  fn.apply(ctx, [args])           ctx
//  fn.bind(ctx)()                  ctx  (permanent)
//  new fn()                        fresh object
//  class method                    instance  (always strict)
//  () => {}  (arrow)               enclosing lexical `this`
//  class field: fn = () => {}      instance  (bound at construction)
//  getter / setter                 the object accessed on
//  DOM addEventListener(fn)        the element  (if regular fn)
//  DOM addEventListener(() => {})  outer lexical scope
//
// ─────────────────────────────────────────────────────────────
// KEY MENTAL MODEL:
//   • Regular function  → `this` set by CALLER at runtime
//   • Arrow function    → `this` set by SCOPE at definition time
//   • Class             → always strict; `this` = instance
// ─────────────────────────────────────────────────────────────
