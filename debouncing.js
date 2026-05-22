/*
 * DEBOUNCE
 * Delays executing `func` until `delay` ms have passed since the last call.
 * Every new call resets the timer, so `func` only fires once the caller goes quiet.
 *
 * Use cases:
 *  - Search input: wait until the user stops typing before hitting the API
 *  - Window resize: recalculate layout only after resizing is done
 *  - Form validation: validate only after the user pauses, not on every keystroke
 *  - Auto-save: save a draft only after the user pauses writing
 */
function myDebounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId); // cancel the previous pending call
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/*
 * THROTTLE
 * Ensures `func` is called at most once per `delay` ms, no matter how often the wrapper is invoked.
 * Unlike debounce, the first call fires immediately and subsequent ones are rate-limited.
 *
 * Use cases:
 *  - Scroll events: update a sticky header position at most every 200ms
 *  - Mouse-move: track cursor position for a tooltip without flooding the handler
 *  - Button clicks: prevent double-submitting a form if the user clicks rapidly
 *  - API rate limiting: cap calls to a third-party endpoint to stay within quotas
 */
function myThrottle(func, delay) {
    let lastCall = 0;
    return function (...args) {
        const now = Date.now();
        if (now - lastCall >= delay) { // enough time has elapsed since the last execution
            func.apply(this, args);
            lastCall = now;
        }
    };
}
