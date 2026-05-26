function MyPromise(executor) {
  this.state = 'pending';
  this.value = undefined;
  this.callbacks = [];

  const resolve = (value) => {
    if (this.state !== 'pending') return;
    // unwrap thenables (Promise resolution procedure)
    if (value && typeof value.then === 'function') {
      return value.then(resolve, reject);
    }
    this.state = 'fulfilled';
    this.value = value;
    this.callbacks.forEach(cb => cb.onFulfilled && cb.onFulfilled(value));
  };

  const reject = (reason) => {
    if (this.state !== 'pending') return;
    this.state = 'rejected';
    this.value = reason;
    this.callbacks.forEach(cb => cb.onRejected && cb.onRejected(reason));
  };

  try {
    executor(resolve, reject);
  } catch (err) {
    reject(err);
  }
}

MyPromise.prototype.then = function (onFulfilled, onRejected) {
  return new MyPromise((resolve, reject) => {
    const handle = (fn, settle) => (value) => {
      if (typeof fn !== 'function') return settle(value);
      try {
        resolve(fn(value));
      } catch (err) {
        reject(err);
      }
    };

    const fulfilled = handle(onFulfilled, resolve);
    const rejected = handle(onRejected, reject);

    if (this.state === 'fulfilled') return setTimeout(() => fulfilled(this.value));
    if (this.state === 'rejected') return setTimeout(() => rejected(this.value));
    this.callbacks.push({ onFulfilled: fulfilled, onRejected: rejected });
  });
};

MyPromise.prototype.catch = function (onRejected) {
  return this.then(null, onRejected);
};

MyPromise.prototype.finally = function (onFinally) {
  return this.then(
    (value) => { onFinally(); return value; },
    (reason) => { onFinally(); throw reason; }
  );
};

MyPromise.resolve = (value) => {
  if (value instanceof MyPromise) return value;
  return new MyPromise((res) => res(value));
};
MyPromise.reject = (reason) => new MyPromise((_, rej) => rej(reason));

MyPromise.all = function (promises) {
  return new MyPromise((resolve, reject) => {
    const results = [];
    let remaining = promises.length;
    if (remaining === 0) return resolve(results);
    promises.forEach((p, i) => {
      MyPromise.resolve(p).then((val) => {
        results[i] = val;
        if (--remaining === 0) resolve(results);
      }, reject);
    });
  });
};

MyPromise.allSettled = function (promises) {
  return new MyPromise((resolve) => {
    const results = [];
    let remaining = promises.length;
    if (remaining === 0) return resolve(results);
    promises.forEach((p, i) => {
      MyPromise.resolve(p).then(
        (value) => { results[i] = { status: 'fulfilled', value }; if (--remaining === 0) resolve(results); },
        (reason) => { results[i] = { status: 'rejected', reason }; if (--remaining === 0) resolve(results); }
      );
    });
  });
};

MyPromise.race = function (promises) {
  return new MyPromise((resolve, reject) => {
    promises.forEach((p) => MyPromise.resolve(p).then(resolve, reject));
  });
};

// --- Demo ---
const p1 = new MyPromise((resolve) => setTimeout(() => resolve('hello'), 100));
const p2 = MyPromise.resolve(42);

p1.then((v) => {
  console.log('p1 resolved:', v);
  return v + ' world';
})
  .then((v) => console.log('chained:', v))
  .catch((e) => console.error('error:', e));

MyPromise.all([p2, MyPromise.resolve('a')]).then((vals) =>
  console.log('all:', vals)
);

MyPromise.race([
  new MyPromise((res) => setTimeout(() => res('slow'), 200)),
  new MyPromise((res) => setTimeout(() => res('fast'), 50)),
]).then((v) => console.log('race winner:', v));
