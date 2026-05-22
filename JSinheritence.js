// ============================================================
// PROTOTYPAL INHERITANCE IN JAVASCRIPT
// ============================================================
// Every JS object has an internal link called [[Prototype]] that
// points to another object (its "prototype"). When you access a
// property, JS looks on the object first, then walks up the chain
// until it finds it or hits null (end of the chain).
// ============================================================


// ------------------------------------------------------------
// 1. PROTOTYPE CHAIN — the foundation
// ------------------------------------------------------------
const animal = {
    breathe() {
        console.log(`${this.name} is breathing`);
    },
};

const dog = Object.create(animal); // dog's [[Prototype]] = animal
dog.name = "Rex";
dog.bark = function () {
    console.log(`${this.name} says: Woof!`);
};

dog.bark();    // Rex says: Woof!   — own method
dog.breathe(); // Rex is breathing  — inherited from animal

console.log(Object.getPrototypeOf(dog) === animal); // true


// ------------------------------------------------------------
// 2. CONSTRUCTOR FUNCTIONS — classic pre-ES6 pattern
// ------------------------------------------------------------
// When called with `new`, a constructor creates an object whose
// [[Prototype]] is set to Constructor.prototype automatically.

function Animal(name, sound) {
    this.name = name;   // own properties set per instance
    this.sound = sound;
}

// Methods live on the shared prototype — not copied per instance
Animal.prototype.speak = function () {
    console.log(`${this.name} says: ${this.sound}`);
};

function Dog(name) {
    Animal.call(this, name, "Woof"); // borrow Animal's constructor
    this.tricks = [];
}

// Wire up the prototype chain: Dog → Animal → Object
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog; // fix the constructor reference

Dog.prototype.learnTrick = function (trick) {
    this.tricks.push(trick);
    console.log(`${this.name} learned: ${trick}`);
};

const rex = new Dog("Rex");
rex.speak();           // Rex says: Woof   — inherited from Animal
rex.learnTrick("sit"); // Rex learned: sit — own Dog method

console.log(rex instanceof Dog);    // true
console.log(rex instanceof Animal); // true — chain is intact


// ------------------------------------------------------------
// 3. ES6 CLASSES — syntactic sugar over the same prototype system
// ------------------------------------------------------------
// `class` is just a cleaner way to write the constructor-function
// pattern above. The prototype chain works identically under the hood.

class Vehicle {
    constructor(make, speed) {
        this.make = make;
        this.speed = speed;
    }

    describe() {
        console.log(`${this.make} travels at ${this.speed} km/h`);
    }
}

class Car extends Vehicle {          // sets Car.prototype[[Prototype]] = Vehicle.prototype
    constructor(make, speed, doors) {
        super(make, speed);          // calls Vehicle's constructor
        this.doors = doors;
    }

    describe() {
        super.describe();            // reuse parent method
        console.log(`It has ${this.doors} doors`);
    }
}

const tesla = new Car("Tesla", 250, 4);
tesla.describe();
// Tesla travels at 250 km/h
// It has 4 doors

console.log(Object.getPrototypeOf(Car.prototype) === Vehicle.prototype); // true


// ------------------------------------------------------------
// 4. HOW THE LOOKUP CHAIN WORKS (visualised)
// ------------------------------------------------------------
//
//   tesla  →  Car.prototype  →  Vehicle.prototype  →  Object.prototype  →  null
//
//   tesla.doors         ✓ found on tesla (own property)
//   tesla.describe()    ✓ found on Car.prototype (overridden)
//   tesla.hasOwnProperty  found on Object.prototype (built-in)
//   tesla.xyz           ✗ not found anywhere → undefined
//


// ------------------------------------------------------------
// 5. KEY METHODS TO INSPECT THE CHAIN
// ------------------------------------------------------------
console.log(tesla.hasOwnProperty("make"));          // true  — own property
console.log(tesla.hasOwnProperty("describe"));      // false — lives on prototype
console.log("describe" in tesla);                   // true  — `in` checks the whole chain
console.log(Object.getPrototypeOf(tesla) === Car.prototype); // true
