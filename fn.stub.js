function is_even(n) {
  if (n == 0) return
  return is_even(n/2);
}

function recursive(n) {
  return recursive(n);
}

function compare_is_even(n) {
  return recursive(n);
}

const x = (n) => {
  return n.map(is_even);
};

console.log(is_even(10));
console.log(compare_is_even([10, 1, 2, 2, 2, 3, 5, 6, 6, 923]).toString());
