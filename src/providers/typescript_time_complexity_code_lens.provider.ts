import * as vscode from "vscode";
import { AnalyzedFunction } from "../interfaces/analyzed-function.interface";
import { complexityOrder } from "../utils/complexity-order";
import { TimeComplexity } from "../enums/time-complexity.enum";

export class TimeComplexityCodeLensProvider implements vscode.CodeLensProvider {
  onDidChangeCodeLenses?: vscode.Event<void>;

  private functionRegexes = [
    /function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*\{((?:[^{}]*|\{(?:[^{}]*|\{[^{}]*\})*\})*)\}/g, // Standard functions
    /([a-zA-Z0-9_]+)\s*=\s*function\s*\(([^)]*)\)\s*\{((?:[^{}]*|\{(?:[^{}]*|\{[^{}]*\})*\})*)\}/g, // Anonymous function expressions assigned to a variable
    /([a-zA-Z0-9_]+)\s*=\s*\(([^)]*)\)\s*=>\s*\{((?:[^{}]*|\{(?:[^{}]*|\{[^{}]*\})*\})*)\}/g, // Arrow functions assigned to a variable
    /([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*\{((?:[^{}]*|\{(?:[^{}]*|\{[^{}]*\})*\})*)\}/g, // Class methods (needs to be careful not to match too broadly)
  ];

  public provideCodeLenses(
    document: vscode.TextDocument
  ): vscode.ProviderResult<vscode.CodeLens[]> {
    const text = document.getText();
    const functions = this.extractFunctions(text, document);
    this.resolveCallGraph(functions);


    return functions.map((fn) => {
      const range = new vscode.Range(fn.position.line, 0, fn.position.line, 0);
      return new vscode.CodeLens(range, {
        title: `Time Complexity: ${fn.complexity}`,
        command: "",
        tooltip: `Estimated time complexity of ${fn.name}`,
      });
    });
  }

  private extractFunctions(
    text: string,
    document: vscode.TextDocument
  ): AnalyzedFunction[] {
    const uniqueFunctions = new Map<string, AnalyzedFunction>();

    for (const regex of this.functionRegexes) {
      regex.lastIndex = 0;
      let match;
      while ((match = regex.exec(text)) !== null) {
        const [_, name, _params, body] = match;
        const pos = document.positionAt(match.index);

        const cleanBody = body
          .replace(/\/\*[\s\S]*?\*\//g, "")
          .replace(/\/\/.*$/gm, "");

        // Create a unique key for the function.
        // We use the function name and its starting line number.
        // Rounding the line number can help if regexes have slight variations in start index.
        const key = `${name}@${pos.line}`;

        // Only add if we haven't seen this unique function declaration before at this line.
        // If a function name appears on multiple lines, we'll treat them as distinct functions.
        if (!uniqueFunctions.has(key)) {
          uniqueFunctions.set(key, {
            name,
            body: cleanBody,
            position: pos,
            calls: this.extractCalls(cleanBody),
            complexity: this.estimateComplexity(cleanBody, name),
          });
        }
      }
    }
    return Array.from(uniqueFunctions.values());
  }

  private extractCalls(body: string): Set<string> {
    const regex = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
    regex.lastIndex = 0;
    const calls = new Set<string>();
    let match;
    while ((match = regex.exec(body)) !== null) {
      const fn = match[1];
      // Exclude common keywords and control flow statements
      if (
        ![
          "for",
          "if",
          "while",
          "switch",
          "return",
          "new",
          "console",
          "class",
          "super",
          "function",
          "import",
          "export",
          "if",
          "else",
          "do",
          "try",
          "catch",
          "finally",
          "with",
        ].includes(fn)
      ) {
        calls.add(fn);
      }
    }
    return calls;
  }

  private resolveCallGraph(functions: AnalyzedFunction[]) {
    const getMaxComplexity = (...complexities: TimeComplexity[]) => {
      return complexities.reduce((max, curr) => {
        return complexityOrder.indexOf(curr) > complexityOrder.indexOf(max)
          ? curr
          : max;
      }, TimeComplexity.CONSTANT);
    };

    const complexityMap = new Map<string, TimeComplexity>();
    for (const fn of functions) {
      complexityMap.set(fn.name, fn.complexity);
    }

    let changed: boolean;
    do {
      changed = false;
      for (const fn of functions) {
        let maxCallComplexity = TimeComplexity.CONSTANT;
        for (const call of fn.calls) {
          const calleeComplexity = complexityMap.get(call);
          if (calleeComplexity) {
            maxCallComplexity = getMaxComplexity(
              maxCallComplexity,
              calleeComplexity
            );
          }
        }
        const newComplexity = getMaxComplexity(
          this.estimateComplexity(fn.body, fn.name),
          maxCallComplexity
        );
        if (newComplexity !== fn.complexity) {
          fn.complexity = newComplexity;
          complexityMap.set(fn.name, newComplexity);
          changed = true;
        }
      }
    } while (changed);
  }

  private estimateComplexity(
    body: string,
    functionName: string
  ): TimeComplexity {
    const arrayOps =
      /\.map\(|\.forEach\(|\.filter\(|\.reduce\(|\.some\(|\.every\(/;
    const sortOps = /\.sort\(/;
    const loops = /\b(for|while)\s*\(/;

    // Regex to capture the first argument of the recursive call.
    // It's global to find all occurrences within the body.
    const recursiveCallWithArgRegex = new RegExp(
      `\\b${functionName}\\s*\\(([^,)]*)\\)`,
      "g"
    );

    let complexity = TimeComplexity.CONSTANT;

    // Prioritize explicit loops/array ops/sorts
    if (loops.test(body) || arrayOps.test(body)) {
      complexity = TimeComplexity.Linear;
    }
    if (sortOps.test(body)) {
      complexity = this.getMaxComplexity(
        complexity,
        TimeComplexity.Linearithmic
      );
    }
    if (loops.test(body) && arrayOps.test(body)) {
      complexity = this.getMaxComplexity(complexity, TimeComplexity.Quadratic);
    }

    // recursion patterns
    recursiveCallWithArgRegex.lastIndex = 0; // Reset before first use in a loop
    let recursiveMatch;
    let isActuallyRecursive = false;
    let maxRecursiveComplexityFound = TimeComplexity.CONSTANT;

    while ((recursiveMatch = recursiveCallWithArgRegex.exec(body)) !== null) {
      isActuallyRecursive = true;
      const paramPassed = recursiveMatch[1] ? recursiveMatch[1].trim() : "";

      if (/\/\s*\d+/.test(paramPassed) || /\*\s*\d+/.test(paramPassed)) {
        maxRecursiveComplexityFound = this.getMaxComplexity(
          maxRecursiveComplexityFound,
          TimeComplexity.Logarithmic
        );
      } else if (
        /\s*-\s*\d+/.test(paramPassed) ||
        /\s*\+\s*\d+/.test(paramPassed)
      ) {
        // Addition or subtraction by a constant (e.g., n-1, n+1) -> O(n)
        maxRecursiveComplexityFound = this.getMaxComplexity(
          maxRecursiveComplexityFound,
          TimeComplexity.Linear
        );
      } else {
        // If no clear linear or logarithmic pattern, assume exponential.
        // This covers cases like fib(n-1) + fib(n-2) or complex arguments.
        maxRecursiveComplexityFound = this.getMaxComplexity(
          maxRecursiveComplexityFound,
          TimeComplexity.Exponential
        );
      }
    }

    if (isActuallyRecursive) {
      complexity = this.getMaxComplexity(
        complexity,
        maxRecursiveComplexityFound
      );
    }

    return complexity;
  }

  private getMaxComplexity = (...complexities: TimeComplexity[]) => {
    return complexities.reduce((max, curr) => {
      return complexityOrder.indexOf(curr) > complexityOrder.indexOf(max)
        ? curr
        : max;
    }, TimeComplexity.CONSTANT);
  };
}
