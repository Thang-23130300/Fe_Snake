import {Snake} from './Core/Snake.js';

const testSnake = new Snake(3);

 console.log("testSnake", testSnake.body);
 console.log("length", testSnake.body.length);

testSnake.body = [
    { x: 4, y: 2 },
    { x: 3, y: 2 },
    { x: 3, y: 3 },
    { x: 4, y: 3 }
];

// Test1 : di vao o duoi , khong an qua
console.log("Test 1:", testSnake.selfCollision({ x: 4, y: 3 }, false));
// Test2 : di vao o duoi , co an qua
console.log("Test 2:", testSnake.selfCollision({ x: 4, y: 3 }, true));
// Test3 : di vao thanh
console.log("Test 3:", testSnake.selfCollision({ x: 3, y: 2 }, false));
// Test4 di vao o trong
console.log("Test 4:", testSnake.selfCollision({ x: 5, y: 2 }, false));

// test move
testSnake.move({ x: 5, y: 2 }, false);

console.log("sau di chuyen", testSnake.body);
console.log("leghth", testSnake.body.length);