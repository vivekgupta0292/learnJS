const person = {
    firstName: 'vivek',
    lastName: 'gupta'
}

const human = {
    canWalk: function(){
        console.log(this.firstName+' can walk');
    }
}

human.canWalk.call(person);

Function.prototype.myCall = function(ctx, ...args) {
    let context = ctx ?? globalThis;
    context.fn = this;
    try {
        context.fn(...args);
    } finally {
        delete context.fn;
    }
}

human.canWalk.myCall(person);

/**
 * Custom implementation of Function.prototype.apply.
 * Invokes the target function with a given 'this' context and an array of arguments.
 * @param {Object} ctx - The object to be used as 'this' context.
 * @param {Array} args - The array of arguments to pass to the function.
 **/
Function.prototype.myApply = function(ctx, args = []) {
    let context = ctx || globalThis;
    context.fn = this;
    try {
        context.fn(...args);
    } finally {
        delete context.fn;
    }
}

human.canWalk.myApply(person);


Function.prototype.myBind = function(ctx, ...args) {
    let context = ctx || globalThis;
    const fn = this;
    return function(...boundArgs) {
        return fn.call(context, ...args, ...boundArgs);
    };
}
const boundCanWalk = human.canWalk.myBind(person);
boundCanWalk();
