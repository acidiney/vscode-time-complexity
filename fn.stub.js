// O(1)
export function getFirstElement(arr) {
  return arr[0];
}

export function sumTwo(a, b) {
  return a + b;
}

export function isEven(n) {
  return n % 2 === 0;
}

export function returnTrue() {
  return true;
}

export function checkBit(num) {
  return (num & 1) === 0;
}

export function identity(x) {
  return x;
}

export function fixedReturn() {
  const x = 10;
  return x * x;
}

// O(log n)
export function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    else if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

export function logBase2(n) {
  while (n > 1) n = Math.floor(n / 2);
}

export function divideUntilOne(n) {
  if (n <= 1) return;
  divideUntilOne(n / 2);
}

export function logLoop(n) {
  for (let i = 1; i < n; i *= 2) {
    console.log(i);
  }
}

export function bitShiftLoop(n) {
  while (n > 0) {
    n >>= 1;
  }
}

export function recursiveDivide(n) {
  if (n <= 1) return;
  return recursiveDivide(n / 2);
}

//  O(n)

export function printAll(arr) {
  for (let i = 0; i < arr.length; i++) {
    console.log(arr[i]);
  }
}

export function sumArray(arr) {
  return arr.reduce((acc, val) => acc + val, 0);
}

export function findMax(arr) {
  let max = arr[0];
  for (const val of arr) if (val > max) max = val;
  return max;
}

export function linearRecursion(n) {
  if (n === 0) return;
  linearRecursion(n - 1);
}

export function whileDecrement(n) {
  while (n > 0) n--;
}

export function oneLoop(n) {
  for (let i = 0; i < n; i++) {}
}

export function arrayForEach(arr) {
  arr.forEach(x => console.log(x));
}

export function mapToDouble(arr) {
  return arr.map(x => x * 2);
}

//  O(n log n)
export function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}
export function merge(l, r) {
  const result = [];
  while (l.length && r.length) {
    result.push(l[0] < r[0] ? l.shift() : r.shift());
  }
  return result.concat(l, r);
}

export function sortArray(arr) {
  return arr.sort();
}

export function logInsideLoop(n) {
  for (let i = 0; i < n; i++) {
    let j = 1;
    while (j < n) {
      j *= 2;
    }
  }
}

export function hybridSort(arr) {
  arr.sort();
  arr.forEach(x => console.log(x));
}

export function nLogNMapSort(arr) {
  return arr.map(x => x).sort();
}

//  O(n²)

export function bubbleSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - 1; j++) {
      if (arr[j] > arr[j + 1]) [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
    }
  }
  return arr;
}

export function printPairs(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length; j++) {
      console.log(arr[i], arr[j]);
    }
  }
}

export function nestedLoop(n) {
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {}
  }
}

export function quadraticRecursion(n) {
  if (n <= 0) return;
  for (let i = 0; i < n; i++) {
    quadraticRecursion(n - 1);
  }
}

export function pairwiseCheck(arr) {
  arr.forEach(a => arr.forEach(b => console.log(a + b)));
}

export function selectSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    let min = i;
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] < arr[min]) min = j;
    }
    [arr[i], arr[min]] = [arr[min], arr[i]];
  }
  return arr;
}

export function printMatrix(n) {
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      console.log(i * j);
    }
  }
}

export function twoNestedLoops(n) {
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {}
  }
}

// O(n³)

export function tripleNestedLoop(n) {
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      for (let k = 0; k < n; k++) {
        console.log(i + j + k);
      }
    }
  }
}

export function cubeMatrix(n) {
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      for (let k = 0; k < n; k++) {
        // do nothing
      }
    }
  }
}

export function nestedQuadraticRecursive(n) {
  if (n <= 0) return;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      nestedQuadraticRecursive(n - 1);
    }
  }
}

export function threeLevelArrayOps(arr) {
  arr.forEach(a => arr.forEach(b => arr.forEach(c => console.log(a + b + c))));
}

// O(2ⁿ)

export function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

export function powerSet(arr) {
  const result = [];
  const generate = (subset, i) => {
    if (i === arr.length) {
      result.push(subset);
      return;
    }
    generate([...subset, arr[i]], i + 1);
    generate(subset, i + 1);
  };
  generate([], 0);
  return result;
}

export function recursiveBinary(n) {
  if (n === 0) return;
  recursiveBinary(n - 1);
  recursiveBinary(n - 1);
}

export function exponentialRec(n) {
  if (n <= 0) return;
  exponentialRec(n - 1);
  exponentialRec(n - 2);
}

export function exponentialBranches(n) {
  if (n <= 1) return;
  exponentialBranches(n - 1);
  exponentialBranches(n - 1);
}

export function towerOfHanoi(n, from, to, aux) {
  if (n === 0) return;
  towerOfHanoi(n - 1, from, aux, to);
  towerOfHanoi(n - 1, aux, to, from);
}


// O(n!)

export function permute(str) {
  if (str.length <= 1) return [str];
  let result = [];
  for (let i = 0; i < str.length; i++) {
    const rest = str.slice(0, i) + str.slice(i + 1);
    for (const p of permute(rest)) {
      result.push(str[i] + p);
    }
  }
  return result;
}

export function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

export function generatePermutations(arr, l, r) {
  if (l === r) {
    console.log(arr);
  } else {
    for (let i = l; i <= r; i++) {
      [arr[l], arr[i]] = [arr[i], arr[l]];
      generatePermutations(arr, l + 1, r);
      [arr[l], arr[i]] = [arr[i], arr[l]];
    }
  }
}

export function backtrackSubset(arr, used = []) {
  if (used.length === arr.length) {
    console.log(used);
    return;
  }
  for (let i = 0; i < arr.length; i++) {
    if (!used.includes(arr[i])) {
      backtrackSubset(arr, [...used, arr[i]]);
    }
  }
}

export function travelingSalesman(n, visited = new Set()) {
  if (visited.size === n) return;
  for (let i = 0; i < n; i++) {
    if (!visited.has(i)) {
      visited.add(i);
      travelingSalesman(n, visited);
      visited.delete(i);
    }
  }
}
