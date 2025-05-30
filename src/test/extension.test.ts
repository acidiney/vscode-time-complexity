import * as vscode from 'vscode';
import { TimeComplexityCodeLensProvider } from '../providers/typescript_time_complexity_code_lens.provider';
import { TimeComplexity } from '../enums/time-complexity.enum';

import assert from 'assert'

describe('TimeComplexityCodeLensProvider', () => {
  let provider: TimeComplexityCodeLensProvider;

  beforeEach(() => {
    provider = new TimeComplexityCodeLensProvider();
  });

  // Helper function to create a mock document and test complexity
  const testComplexity = (code: string, expectedComplexity: TimeComplexity) => {
    const mockDocument = {
      getText: () => code,
      fileName: 'test.ts',
      positionAt: (offset: number) => new vscode.Position(0, 0)
    } as vscode.TextDocument;

    const codeLenses = provider.provideCodeLenses(mockDocument) as vscode.CodeLens[];
    assert.equal(codeLenses.length, 1)
    assert.equal(codeLenses[0].command?.title, `Time Complexity: ${expectedComplexity}`);
  };

  describe('O(1) - Constant Time Functions', () => {
    test('getFirstElement should be O(1)', () => {
      const code = `
        export function getFirstElement(arr) {
          return arr[0];
        }
      `;
      testComplexity(code, TimeComplexity.CONSTANT);
    });

    test('sumTwo should be O(1)', () => {
      const code = `
        export function sumTwo(a, b) {
          return a + b;
        }
      `;
      testComplexity(code, TimeComplexity.CONSTANT);
    });

    test('isEven should be O(1)', () => {
      const code = `
        export function isEven(n) {
          return n % 2 === 0;
        }
      `;
      testComplexity(code, TimeComplexity.CONSTANT);
    });

    test('returnTrue should be O(1)', () => {
      const code = `
        export function returnTrue() {
          return true;
        }
      `;
      testComplexity(code, TimeComplexity.CONSTANT);
    });

    test('checkBit should be O(1)', () => {
      const code = `
        export function checkBit(num) {
          return (num & 1) === 0;
        }
      `;
      testComplexity(code, TimeComplexity.CONSTANT);
    });

    test('identity should be O(1)', () => {
      const code = `
        export function identity(x) {
          return x;
        }
      `;
      testComplexity(code, TimeComplexity.CONSTANT);
    });

    test('fixedReturn should be O(1)', () => {
      const code = `
        export function fixedReturn() {
          const x = 10;
          return x * x;
        }
      `;
      testComplexity(code, TimeComplexity.CONSTANT);
    });
  });

  describe('O(log n) - Logarithmic Time Functions', () => {
    test('binarySearch should be O(log n)', () => {
      const code = `
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
      `;
      testComplexity(code, TimeComplexity.Logarithmic);
    });

    test('logBase2 should be O(log n)', () => {
      const code = `
        export function logBase2(n) {
          while (n > 1) n = Math.floor(n / 2);
        }
      `;
      testComplexity(code, TimeComplexity.Logarithmic);
    });

    test('divideUntilOne should be O(log n)', () => {
      const code = `
        export function divideUntilOne(n) {
          if (n <= 1) return;
          divideUntilOne(n / 2);
        }
      `;
      testComplexity(code, TimeComplexity.Logarithmic);
    });

    test('logLoop should be O(log n)', () => {
      const code = `
        export function logLoop(n) {
          for (let i = 1; i < n; i *= 2) {
            console.log(i);
          }
        }
      `;
      testComplexity(code, TimeComplexity.Logarithmic);
    });

    test('bitShiftLoop should be O(log n)', () => {
      const code = `
        export function bitShiftLoop(n) {
          while (n > 0) {
            n >>= 1;
          }
        }
      `;
      testComplexity(code, TimeComplexity.Logarithmic);
    });

    test('recursiveDivide should be O(log n)', () => {
      const code = `
        export function recursiveDivide(n) {
          if (n <= 1) return;
          return recursiveDivide(n / 2);
        }
      `;
      testComplexity(code, TimeComplexity.Logarithmic);
    });
  });

  describe('O(n) - Linear Time Functions', () => {
    test('printAll should be O(n)', () => {
      const code = `
        export function printAll(arr) {
          for (let i = 0; i < arr.length; i++) {
            console.log(arr[i]);
          }
        }
      `;
      testComplexity(code, TimeComplexity.Linear);
    });

    test('sumArray should be O(n)', () => {
      const code = `
        export function sumArray(arr) {
          return arr.reduce((acc, val) => acc + val, 0);
        }
      `;
      testComplexity(code, TimeComplexity.Linear);
    });

    test('findMax should be O(n)', () => {
      const code = `
        export function findMax(arr) {
          let max = arr[0];
          for (const val of arr) if (val > max) max = val;
          return max;
        }
      `;
      testComplexity(code, TimeComplexity.Linear);
    });

    test('linearRecursion should be O(n)', () => {
      const code = `
        export function linearRecursion(n) {
          if (n === 0) return;
          linearRecursion(n - 1);
        }
      `;
      testComplexity(code, TimeComplexity.Linear);
    });

    test('whileDecrement should be O(n)', () => {
      const code = `
        export function whileDecrement(n) {
          while (n > 0) n--;
        }
      `;
      testComplexity(code, TimeComplexity.Linear);
    });

    test('oneLoop should be O(n)', () => {
      const code = `
        export function oneLoop(n) {
          for (let i = 0; i < n; i++) {}
        }
      `;
      testComplexity(code, TimeComplexity.Linear);
    });

    test('arrayForEach should be O(n)', () => {
      const code = `
        export function arrayForEach(arr) {
          arr.forEach(x => console.log(x));
        }
      `;
      testComplexity(code, TimeComplexity.Linear);
    });

    test('mapToDouble should be O(n)', () => {
      const code = `
        export function mapToDouble(arr) {
          return arr.map(x => x * 2);
        }
      `;
      testComplexity(code, TimeComplexity.Linear);
    });
  });

  describe('O(n log n) - Linearithmic Time Functions', () => {
    test('mergeSort should be O(n log n)', () => {
      const code = `
        export function mergeSort(arr) {
          if (arr.length <= 1) return arr;
          const mid = Math.floor(arr.length / 2);
          const left = mergeSort(arr.slice(0, mid));
          const right = mergeSort(arr.slice(mid));
          return merge(left, right);
        }
      `;
      testComplexity(code, TimeComplexity.Linearithmic);
    });

    test('sortArray should be O(n log n)', () => {
      const code = `
        export function sortArray(arr) {
          return arr.sort();
        }
      `;
      testComplexity(code, TimeComplexity.Linearithmic);
    });

    test('logInsideLoop should be O(n log n)', () => {
      const code = `
        export function logInsideLoop(n) {
          for (let i = 0; i < n; i++) {
            let j = 1;
            while (j < n) {
              j *= 2;
            }
          }
        }
      `;
      testComplexity(code, TimeComplexity.Linearithmic);
    });

    test('hybridSort should be O(n log n)', () => {
      const code = `
        export function hybridSort(arr) {
          arr.sort();
          arr.forEach(x => console.log(x));
        }
      `;
      testComplexity(code, TimeComplexity.Linearithmic);
    });

    test('nLogNMapSort should be O(n log n)', () => {
      const code = `
        export function nLogNMapSort(arr) {
          return arr.map(x => x).sort();
        }
      `;
      testComplexity(code, TimeComplexity.Linearithmic);
    });
  });

  describe('O(n²) - Quadratic Time Functions', () => {
    test('bubbleSort should be O(n²)', () => {
      const code = `
        export function bubbleSort(arr) {
          for (let i = 0; i < arr.length; i++) {
            for (let j = 0; j < arr.length - 1; j++) {
              if (arr[j] > arr[j + 1]) [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
          }
          return arr;
        }
      `;
      testComplexity(code, TimeComplexity.Quadratic);
    });

    test('printPairs should be O(n²)', () => {
      const code = `
        export function printPairs(arr) {
          for (let i = 0; i < arr.length; i++) {
            for (let j = 0; j < arr.length; j++) {
              console.log(arr[i], arr[j]);
            }
          }
        }
      `;
      testComplexity(code, TimeComplexity.Quadratic);
    });

    test('nestedLoop should be O(n²)', () => {
      const code = `
        export function nestedLoop(n) {
          for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {}
          }
        }
      `;
      testComplexity(code, TimeComplexity.Quadratic);
    });

    test('quadraticRecursion should be O(n²)', () => {
      const code = `
        export function quadraticRecursion(n) {
          if (n <= 0) return;
          for (let i = 0; i < n; i++) {
            quadraticRecursion(n - 1);
          }
        }
      `;
      testComplexity(code, TimeComplexity.Quadratic);
    });

    test('pairwiseCheck should be O(n²)', () => {
      const code = `
        export function pairwiseCheck(arr) {
          arr.forEach(a => arr.forEach(b => console.log(a + b)));
        }
      `;
      testComplexity(code, TimeComplexity.Quadratic);
    });

    test('selectSort should be O(n²)', () => {
      const code = `
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
      `;
      testComplexity(code, TimeComplexity.Quadratic);
    });

    test('printMatrix should be O(n²)', () => {
      const code = `
        export function printMatrix(n) {
          for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
              console.log(i * j);
            }
          }
        }
      `;
      testComplexity(code, TimeComplexity.Quadratic);
    });

    test('twoNestedLoops should be O(n²)', () => {
      const code = `
        export function twoNestedLoops(n) {
          for (let i = 0; i < n; i++) {
            for (let j = i; j < n; j++) {}
          }
        }
      `;
      testComplexity(code, TimeComplexity.Quadratic);
    });
  });

  describe('O(n³) - Cubic Time Functions', () => {
    test('tripleNestedLoop should be O(n³)', () => {
      const code = `
        export function tripleNestedLoop(n) {
          for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
              for (let k = 0; k < n; k++) {
                console.log(i + j + k);
              }
            }
          }
        }
      `;
      testComplexity(code, TimeComplexity.Cubic);
    });

    test('cubeMatrix should be O(n³)', () => {
      const code = `
        export function cubeMatrix(n) {
          for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
              for (let k = 0; k < n; k++) {
                // do nothing
              }
            }
          }
        }
      `;
      testComplexity(code, TimeComplexity.Cubic);
    });

    test('nestedQuadraticRecursive should be O(n³)', () => {
      const code = `
        export function nestedQuadraticRecursive(n) {
          if (n <= 0) return;
          for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
              nestedQuadraticRecursive(n - 1);
            }
          }
        }
      `;
      testComplexity(code, TimeComplexity.Cubic);
    });

    test('threeLevelArrayOps should be O(n³)', () => {
      const code = `
        export function threeLevelArrayOps(arr) {
          arr.forEach(a => arr.forEach(b => arr.forEach(c => console.log(a + b + c))));
        }
      `;
      testComplexity(code, TimeComplexity.Cubic);
    });
  });

  describe('O(2ⁿ) - Exponential Time Functions', () => {
    test('fibonacci should be O(2ⁿ)', () => {
      const code = `
        export function fibonacci(n) {
          if (n <= 1) return n;
          return fibonacci(n - 1) + fibonacci(n - 2);
        }
      `;
      testComplexity(code, TimeComplexity.Exponential);
    });

    test('powerSet should be O(2ⁿ)', () => {
      const code = `
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
      `;
      testComplexity(code, TimeComplexity.Exponential);
    });

    test('recursiveBinary should be O(2ⁿ)', () => {
      const code = `
        export function recursiveBinary(n) {
          if (n === 0) return;
          recursiveBinary(n - 1);
          recursiveBinary(n - 1);
        }
      `;
      testComplexity(code, TimeComplexity.Exponential);
    });

    test('exponentialRec should be O(2ⁿ)', () => {
      const code = `
        export function exponentialRec(n) {
          if (n <= 0) return;
          exponentialRec(n - 1);
          exponentialRec(n - 2);
        }
      `;
      testComplexity(code, TimeComplexity.Exponential);
    });

    test('exponentialBranches should be O(2ⁿ)', () => {
      const code = `
        export function exponentialBranches(n) {
          if (n <= 1) return;
          exponentialBranches(n - 1);
          exponentialBranches(n - 1);
        }
      `;
      testComplexity(code, TimeComplexity.Exponential);
    });

    test('towerOfHanoi should be O(2ⁿ)', () => {
      const code = `
        export function towerOfHanoi(n, from, to, aux) {
          if (n === 0) return;
          towerOfHanoi(n - 1, from, aux, to);
          towerOfHanoi(n - 1, aux, to, from);
        }
      `;
      testComplexity(code, TimeComplexity.Exponential);
    });
  });

  describe('O(n!) - Factorial Time Functions', () => {
    test('permute should be O(n!)', () => {
      const code = `
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
      `;
      testComplexity(code, TimeComplexity.Factorial);
    });


    test('generatePermutations should be O(n!)', () => {
      const code = `
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
      `;
      testComplexity(code, TimeComplexity.Factorial);
    });

    test('backtrackSubset should be O(n!)', () => {
      const code = `
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
      `;
      testComplexity(code, TimeComplexity.Factorial);
    });

    test('travelingSalesman should be O(n!)', () => {
      const code = `
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
      `;
      testComplexity(code, TimeComplexity.Factorial);
    });
  });

  describe('Edge Cases and Complex Scenarios', () => {
    test('function with multiple complexity patterns should use highest', () => {
      const code = `
        export function complexFunction(arr, n) {
          // O(n log n) - sort
          arr.sort();

          // O(n²) - nested loops
          for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
              console.log(i, j);
            }
          }

          // O(n) - single loop
          for (let k = 0; k < n; k++) {
            console.log(k);
          }
        }
      `;
      testComplexity(code, TimeComplexity.Quadratic);
    });

    test('recursive function with loop should combine complexities', () => {
      const code = `
        export function recursiveWithLoop(n) {
          if (n <= 0) return;
          for (let i = 0; i < n; i++) {
            console.log(i);
          }
          recursiveWithLoop(n - 1);
        }
      `;
      testComplexity(code, TimeComplexity.Quadratic);
    });

    test('multiple recursive calls should be exponential', () => {
      const code = `
        export function multipleRecursiveCalls(n) {
          if (n <= 1) return 1;
          return multipleRecursiveCalls(n - 1) + multipleRecursiveCalls(n - 1);
        }
      `;
      testComplexity(code, TimeComplexity.Exponential);
    });
  });
});