# Time Complexity Analyzer

A simple adapter to manage time complexity in your applications.
Motivation

Ever been stuck? You're looking at your code, and you just know it's slow, but where's the bottleneck? How does that loop or recursive function really scale? Suddenly, you're guessing, or worse, running benchmarks that take forever.

That's where the Time Complexity Analyzer steps in. The general idea? Simple: open your file and voilà. Instant Big O notation, right there in your editor. Your code keeps humming, and you get immediate insights into its performance characteristics.
Installation Process

This extension will soon be available on the VS Code Marketplace. For now, you can install it from source. Just use:

```bash
$ git clone https://github.com/acidiney/vscode-time-complexity
$ cd vscode-time-complexity
$ npm install
$ npm run compile
```

Then, in VS Code:

  - Open the Extensions view (Ctrl+Shift+X or Cmd+Shift+X).

  - Click ... (More Actions) -> Install from VSIX....

  - Select the .vsix file from your project.

Or, for development, just open the project folder in VS Code and hit F5 to run the "Extension Tests" debug configuration.
Usage

After installing the extension, just open a JavaScript or TypeScript file in your VS Code editor. The estimated time complexity will magically appear as a CodeLens right above your function declarations. Pretty neat, right?

Example:
```js
// Time Complexity: O(log n)
function findElement(arr, target) {
    let low = 0;
    let high = arr.length - 1;
    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        if (arr[mid] === target) {
            return mid;
        } else if (arr[mid] < target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    return -1;
}

// Time Complexity: O(n^2)
function processAllPairs(data) {
    data.forEach(item1 => {
        data.forEach(item2 => {
            console.log(item1, item2);
        });
    });
}
```

## The Time Complexity Analyzer API (Features)

The Analyzer implements smart detection for common code patterns. The main idea is to not guess about your code's performance when you're writing it.
Features

  - Inline Complexity Display: See the estimated Big O notation `(e.g., O(1), O(log n), O(n), O(n log n), O(n^2), O(2^n), O(n!))` right in your code.

  - Smart Recursion Analysis: It tries its best to figure out if your recursive functions are logarithmic, linear, or even exponential.

  - Call Graph Resolution: It looks at what functions your function calls and factors their complexity into the overall estimate.

  - Real-time Updates: Type, save, watch the numbers change. It's that responsive!

## Support

Time Complexity Analyzer currently supports:

    JavaScript (.js)

    TypeScript (.ts)

    ...and more to come!

## Limitations

It's important to know that this isn't a crystal ball, but a smart guesser. Here's what it doesn't do (yet!):

    Heuristic-Based: It uses clever patterns, not a deep, philosophical understanding of your code. So, it's not 100% perfect for every weird trick you might pull.

    No Runtime Analysis: It's all about the code on the page, not how fast it runs in real life.

    Scope Ambiguity: Sometimes, figuring out exactly which function is which in super complex nested scopes can be tricky for a regex.

    Argument Interpretation: It's good with simple math in recursive arguments, but if you're doing rocket science in there, it might just shrug.

    External Libraries/APIs: It won't magically know the complexity of someExternalLibrary.doSomethingVeryComplex() unless it can see its code.

For hardcore, bulletproof complexity analysis, you'd need a super-duper tool with full code parsing. But for quick, helpful insights right in your editor, this is pretty solid!

## Author
Acidiney Dias

## License
MIT