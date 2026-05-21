// ============================================================
// CURRYING IN JAVASCRIPT
// ============================================================
// Currying transforms a function that takes multiple arguments
// into a chain of functions that each take ONE argument.
//
// Normal:   add(2, 3)       → 5
// Curried:  add(2)(3)       → 5
// ============================================================


// ── EXAMPLE 1: The simplest possible curry ──────────────────
// Imagine a coffee shop. You don't decide everything at once.
// First you pick the size, then the type, then the milk.

function orderCoffee(size) {
  return function (type) {
    return function (milk) {
      return `${size} ${type} with ${milk}`;
    };
  };
}

// console.log(orderCoffee("Large")("Latte")("Oat milk"));
// → "Large Latte with Oat milk"

// You can also save each step for later:
const largeCoffee = orderCoffee("Large");        // step 1 locked in
const largeLatte  = largeCoffee("Latte");        // step 2 locked in
// console.log(largeLatte("Almond milk"));          // step 3 completes it
// → "Large Latte with Almond milk"


// ── EXAMPLE 2: Arrow function syntax (same thing, cleaner) ──
const multiply = (a) => (b) => a * b;

const double = multiply(2);   // "double anything" — b is still open
const triple = multiply(3);   // "triple anything"

// console.log(double(5));  // → 10
// console.log(triple(5));  // → 15
// console.log(double(9));  // → 18


// ── EXAMPLE 3: Real-world use — discount calculator ─────────
// A shop has different discount rates for different membership tiers.
// Instead of passing the discount every single time, lock it in once.

const applyDiscount = (discountPercent) => (price) =>
  price - (price * discountPercent) / 100;

const silverDiscount = applyDiscount(10);  // 10% off
const goldDiscount   = applyDiscount(25);  // 25% off
const vipDiscount    = applyDiscount(50);  // 50% off

// console.log(silverDiscount(200));  // → 180
// console.log(goldDiscount(200));    // → 150
// console.log(vipDiscount(200));     // → 100


// ── EXAMPLE 4: Real-world use — greeting generator ──────────
// A website greets users differently based on language.

const greet = (language) => (timeOfDay) => (name) => {
  const greetings = {
    english: { morning: "Good Morning", evening: "Good Evening" },
    spanish: { morning: "Buenos Días", evening: "Buenas Noches" },
  };
  return `${greetings[language][timeOfDay]}, ${name}!`;
};

const englishGreet = greet("english");
const spanishGreet = greet("spanish");

// console.log(englishGreet("morning")("Alice"));  // → "Good Morning, Alice!"
// console.log(spanishGreet("evening")("Carlos")); // → "Buenas Noches, Carlos!"


// ── EXAMPLE 5: A generic curry() helper ─────────────────────
// Instead of manually nesting functions, use a curry() utility
// that automatically curries any function for you.

function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn(...args);          // enough args → call the original
    }
    return (...more) => curried(...args, ...more);  // wait for more
  };
}

const add = curry((a, b, c) => a + b + c);

// console.log(add(1)(2)(3));    // → 6  (one at a time)
// console.log(add(1, 2)(3));    // → 6  (two then one)
// console.log(add(1)(2, 3));    // → 6  (one then two)
// console.log(add(1, 2, 3));    // → 6  (all at once — still works)


// ── WHEN TO USE CURRYING ────────────────────────────────────
// ✔ When you reuse a function with the same first argument(s) repeatedly
// ✔ When building pipelines / composed functions
// ✔ When you want to create specialised versions of general functions
//   e.g. double, triple from multiply; silverDiscount from applyDiscount


// ── EXAMPLE 6: Infinite currying — sum any number of values ─
// Call with numbers to keep adding. Call with no argument () to get the result.
//
// Think of it like a cashier at a shop:
//   - You keep handing items (numbers) one by one.
//   - When you're done, you say "total please" → call with ()
//   - The cashier then gives you the final sum.

function infiniteSum(a) {
  return function (b) {
    return b !== undefined ? infiniteSum(a + b) : a;
  };
}

console.log(infiniteSum(1)(2)());           // → 3
console.log(infiniteSum(1)(2)(3)());        // → 6
console.log(infiniteSum(1)(2)(3)(4)());     // → 10
console.log(infiniteSum(5)(10)(20)(5)());   // → 40

// Arrow function version (same logic, shorter):
const sum = a => b => b !== undefined ? sum(a + b) : a;

console.log(sum(1)(2)(3)(4)(5)());  // → 15

// ── WHY b !== undefined instead of just !b ? ────────────────
// Using !b would break when you pass 0, because !0 is true (falsy trap).
// sum(1)(2)(0)(3)()  should give 6, not stop at 0.
console.log(sum(1)(2)(0)(3)());  // → 6  ✔  (works correctly)