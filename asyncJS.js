// ─────────────────────────────────────────────────────────────
// ASYNC EXECUTION IN JAVASCRIPT
// ─────────────────────────────────────────────────────────────
// JS is single-threaded but non-blocking. Async work is handed
// off to Web APIs / Node internals; callbacks are queued and
// run by the Event Loop once the call stack is empty.
// ─────────────────────────────────────────────────────────────


// ─── 1. SYNCHRONOUS BASELINE ─────────────────────────────────
// Each line blocks the next — runs top to bottom.
console.log("--- 1. Synchronous ---");
console.log("A");
console.log("B");
console.log("C");
// Output: A → B → C


// ─── 2. setTimeout — MACRO-TASK QUEUE ────────────────────────
// The callback is placed in the macro-task queue after ~delay ms.
// It only runs after the current call stack clears.
console.log("\n--- 2. setTimeout ---");
console.log("start");
setTimeout(() => console.log("timeout (macro-task)"), 0); // even 0ms is deferred
console.log("end");
// Output: start → end → timeout (macro-task)


// ─── 3. CALLBACKS ────────────────────────────────────────────
// The oldest async pattern: pass a function to be called later.
console.log("\n--- 3. Callbacks ---");

function fetchDataCallback(id, callback) {
  setTimeout(() => {
    const data = { id, name: "Alice" };
    callback(null, data); // convention: (error, result)
  }, 500);
}

fetchDataCallback(1, (err, data) => {
  if (err) return console.error(err);
  console.log("Callback result:", data);
});

// Callback Hell — deeply nested, hard to read:
//
// fetchDataCallback(1, (err, user) => {
//   fetchOrders(user.id, (err, orders) => {
//     fetchDetails(orders[0], (err, detail) => { ... });
//   });
// });


// ─── 4. PROMISES ─────────────────────────────────────────────
// A Promise represents a value that will be available in the
// future: pending → fulfilled | rejected.
// .then() callbacks go into the MICRO-TASK queue (higher priority
// than setTimeout macro-tasks).
console.log("\n--- 4. Promises ---");

function fetchDataPromise(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id <= 0) reject(new Error("Invalid ID"));
      else resolve({ id, name: "Bob" });
    }, 300);
  });
}

fetchDataPromise(2)
  .then((data) => {
    console.log("Promise resolved:", data);
    return data.name.toUpperCase(); // chain — each .then gets prior return value
  })
  .then((name) => console.log("Chained .then:", name))
  .catch((err) => console.error("Promise rejected:", err.message));

// Rejection example
fetchDataPromise(-1).catch((err) => console.error("Expected error:", err.message));


// ─── 5. MICRO-TASK vs MACRO-TASK ORDER ───────────────────────
// Micro-tasks (Promise callbacks) always run BEFORE the next macro-task.
console.log("\n--- 5. Task queue order ---");

console.log("sync 1");

setTimeout(() => console.log("macro-task (setTimeout)"), 0);

Promise.resolve().then(() => console.log("micro-task (Promise.then)"));

console.log("sync 2");
// Output: sync 1 → sync 2 → micro-task → macro-task


// ─── 6. ASYNC / AWAIT ────────────────────────────────────────
// Syntactic sugar over Promises. Makes async code look synchronous.
// `await` pauses execution of the current async function only —
// the rest of the program keeps running.
console.log("\n--- 6. async/await ---");

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getUserData(id) {
  await delay(200);
  if (id === 99) throw new Error("User not found");
  return { id, name: "Carol" };
}

async function main() {
  try {
    const user = await getUserData(3);
    console.log("async/await result:", user);

    // Awaiting a rejection triggers the catch block
    await getUserData(99);
  } catch (err) {
    console.error("Caught in async/await:", err.message);
  }
}

main();


// ─── 7. PROMISE COMBINATORS ──────────────────────────────────
// Run multiple async operations concurrently (not sequentially).
console.log("\n--- 7. Promise combinators ---");

const p1 = new Promise((res) => setTimeout(() => res("P1 done"), 400));
const p2 = new Promise((res) => setTimeout(() => res("P2 done"), 200));
const p3 = new Promise((_, rej) => setTimeout(() => rej("P3 failed"), 300));

// Promise.all — waits for ALL to resolve; rejects immediately if any rejects
Promise.all([p1, p2])
  .then((results) => console.log("Promise.all:", results))
  .catch((err) => console.error("Promise.all error:", err));

// Promise.allSettled — waits for ALL, never rejects, gives each outcome
Promise.allSettled([p1, p2, p3]).then((results) => {
  results.forEach(({ status, value, reason }) =>
    console.log(`allSettled → ${status}:`, value ?? reason)
  );
});

// Promise.race — settles as soon as the FIRST one settles (resolve or reject)
Promise.race([p1, p2]).then((winner) => console.log("Promise.race winner:", winner));

// Promise.any — resolves with the FIRST fulfilled; rejects only if ALL reject
Promise.any([p2, p3]).then((first) => console.log("Promise.any first fulfilled:", first));


// ─── 8. PARALLEL vs SEQUENTIAL AWAIT ────────────────────────
console.log("\n--- 8. Parallel vs sequential ---");

async function sequential() {
  const a = await delay(300).then(() => "A"); // waits 300 ms
  const b = await delay(300).then(() => "B"); // then waits another 300 ms
  console.log("Sequential (600 ms total):", a, b);
}

async function parallel() {
  // Both delays START at the same time
  const [a, b] = await Promise.all([
    delay(300).then(() => "A"),
    delay(300).then(() => "B"),
  ]);
  console.log("Parallel   (300 ms total):", a, b);
}

sequential();
parallel();


// ─── 9. ASYNC ITERATION (for await...of) ─────────────────────
// Consume async data sources (streams, generators, paginated APIs) one item at a time.
console.log("\n--- 9. for await...of ---");

async function* asyncGenerator() {
  const items = ["x", "y", "z"];
  for (const item of items) {
    await delay(100);
    yield item;
  }
}

async function consumeAsync() {
  for await (const item of asyncGenerator()) {
    console.log("Async iterator item:", item);
  }
}

consumeAsync();


// ─── 10. PROMISE POLYFILL (built from scratch) ───────────────
// Understanding how Promise works internally by re-implementing
// the core spec: state machine + micro-task scheduling.
console.log("\n--- 10. Promise Polyfill ---");

const PENDING   = "pending";
const FULFILLED = "fulfilled";
const REJECTED  = "rejected";

class MyPromise {
  #state   = PENDING;
  #value   = undefined;          // resolved value or rejection reason
  #handlers = [];                // { onFulfilled, onRejected, resolve, reject }

  constructor(executor) {
    // executor runs synchronously, just like native Promise
    try {
      executor(
        (value)  => this.#resolve(value),
        (reason) => this.#reject(reason)
      );
    } catch (err) {
      this.#reject(err);
    }
  }

  // ── Internal state transition ──────────────────────────────
  #resolve(value) {
    if (this.#state !== PENDING) return; // transitions are one-way

    // If resolved with another thenable, adopt its state (Promise Resolution Procedure)
    if (value && typeof value.then === "function") {
      value.then(
        (v) => this.#resolve(v),
        (r) => this.#reject(r)
      );
      return;
    }

    this.#state = FULFILLED;
    this.#value = value;
    this.#runHandlers();
  }

  #reject(reason) {
    if (this.#state !== PENDING) return;
    this.#state = REJECTED;
    this.#value = reason;
    this.#runHandlers();
  }

  // ── Drain queued handlers once state is settled ────────────
  #runHandlers() {
    this.#handlers.forEach(({ onFulfilled, onRejected, resolve, reject }) => {
      // Handlers must run asynchronously (micro-task).
      // queueMicrotask is the modern, spec-accurate way to do this.
      queueMicrotask(() => {
        const handler = this.#state === FULFILLED ? onFulfilled : onRejected;

        if (typeof handler !== "function") {
          // No handler for this outcome → propagate as-is
          this.#state === FULFILLED ? resolve(this.#value) : reject(this.#value);
          return;
        }

        try {
          resolve(handler(this.#value)); // return value feeds next .then()
        } catch (err) {
          reject(err);
        }
      });
    });

    this.#handlers = []; // clear once drained
  }

  // ── Public API ─────────────────────────────────────────────

  then(onFulfilled, onRejected) {
    // .then() always returns a NEW promise (enables chaining)
    return new MyPromise((resolve, reject) => {
      const handler = { onFulfilled, onRejected, resolve, reject };

      if (this.#state === PENDING) {
        this.#handlers.push(handler); // schedule for later
      } else {
        // Already settled — queue the handler immediately
        this.#handlers.push(handler);
        this.#runHandlers();
      }
    });
  }

  catch(onRejected) {
    return this.then(undefined, onRejected); // just .then with no fulfillment handler
  }

  finally(onFinally) {
    return this.then(
      (value) => MyPromise.resolve(onFinally()).then(() => value),
      (reason) => MyPromise.resolve(onFinally()).then(() => { throw reason; })
    );
  }

  // ── Static helpers ─────────────────────────────────────────

  static resolve(value) {
    return new MyPromise((res) => res(value));
  }

  static reject(reason) {
    return new MyPromise((_, rej) => rej(reason));
  }

  static all(promises) {
    return new MyPromise((resolve, reject) => {
      const results = [];
      let remaining = promises.length;
      if (remaining === 0) return resolve(results);

      promises.forEach((p, i) => {
        MyPromise.resolve(p).then((value) => {
          results[i] = value;
          if (--remaining === 0) resolve(results); // all done
        }, reject); // first rejection short-circuits
      });
    });
  }

  static allSettled(promises) {
    return new MyPromise((resolve) => {
      const results = [];
      let remaining = promises.length;
      if (remaining === 0) return resolve(results);

      promises.forEach((p, i) => {
        MyPromise.resolve(p).then(
          (value)  => { results[i] = { status: FULFILLED, value };  if (--remaining === 0) resolve(results); },
          (reason) => { results[i] = { status: REJECTED,  reason }; if (--remaining === 0) resolve(results); }
        );
      });
    });
  }

  static race(promises) {
    return new MyPromise((resolve, reject) => {
      promises.forEach((p) => MyPromise.resolve(p).then(resolve, reject));
    });
  }

  static any(promises) {
    return new MyPromise((resolve, reject) => {
      const errors = [];
      let remaining = promises.length;
      if (remaining === 0) return reject(new AggregateError([], "All promises rejected"));

      promises.forEach((p, i) => {
        MyPromise.resolve(p).then(resolve, (reason) => {
          errors[i] = reason;
          if (--remaining === 0) reject(new AggregateError(errors, "All promises rejected"));
        });
      });
    });
  }
}

// ── Demo: MyPromise behaves like native Promise ────────────────

// Basic resolve / chain
new MyPromise((resolve) => setTimeout(() => resolve(42), 100))
  .then((v) => {
    console.log("MyPromise resolved:", v);       // 42
    return v * 2;
  })
  .then((v) => console.log("MyPromise chained:", v))  // 84
  .catch((e) => console.error(e));

// Rejection + catch
new MyPromise((_, reject) => setTimeout(() => reject("oops"), 150))
  .then(() => console.log("should not run"))
  .catch((r) => console.log("MyPromise caught:", r));  // oops

// Resolving with another thenable (Promise Resolution Procedure)
new MyPromise((resolve) => resolve(MyPromise.resolve("nested")))
  .then((v) => console.log("MyPromise nested resolve:", v)); // nested

// finally
MyPromise.resolve("done")
  .finally(() => console.log("MyPromise finally runs"))
  .then((v) => console.log("Value preserved after finally:", v));

// Static combinators
MyPromise.all([MyPromise.resolve(1), MyPromise.resolve(2)])
  .then((r) => console.log("MyPromise.all:", r));   // [1, 2]

MyPromise.race([
  new MyPromise((res) => setTimeout(() => res("slow"), 200)),
  new MyPromise((res) => setTimeout(() => res("fast"), 50)),
]).then((winner) => console.log("MyPromise.race:", winner)); // fast

// ── Key Insight ───────────────────────────────────────────────
// The polyfill reveals the three core primitives that make
// Promises work:
//
//  1. STATE MACHINE      pending → fulfilled | rejected (one-way)
//  2. HANDLER QUEUE      .then() callbacks stored if still pending,
//                        flushed immediately if already settled
//  3. MICRO-TASK ASYNC   queueMicrotask() ensures handlers never run
//                        synchronously, matching the spec guarantee
