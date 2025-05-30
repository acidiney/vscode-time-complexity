import * as vscode from "vscode";
import { AnalyzedFunction } from "../interfaces/analyzed-function.interface";
import { complexityOrder } from "../utils/complexity-order";
import { TimeComplexity } from "../enums/time-complexity.enum";
import ts from "typescript";

export class TimeComplexityCodeLensProvider implements vscode.CodeLensProvider {
  onDidChangeCodeLenses?: vscode.Event<void>;

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

  private extractFunctions(text: string, document: vscode.TextDocument): AnalyzedFunction[] {
    const sourceFile = ts.createSourceFile(
      document.fileName,
      text,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX
    );

    const functions: AnalyzedFunction[] = [];

    const visit = (node: ts.Node) => {
      if (
        ts.isFunctionDeclaration(node) ||
        ts.isFunctionExpression(node) ||
        ts.isArrowFunction(node) ||
        ts.isMethodDeclaration(node)
      ) {
        const name = this.getFunctionName(node);
        if (!name) { return; }

        const start = node.getStart();
        const end = node.getEnd();
        const bodyText = text.slice(start, end);
        const position = document.positionAt(start);

        functions.push({
          name,
          body: bodyText,
          position,
          calls: this.extractCalls(bodyText),
          complexity: this.estimateComplexity(bodyText, name),
        });
      }
      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return functions;
  }

  private getFunctionName(node: ts.FunctionLikeDeclaration): string | null {
    if (ts.isFunctionDeclaration(node) && node.name) {
      return node.name.text;
    } else if (
      (ts.isFunctionExpression(node) || ts.isArrowFunction(node)) &&
      node.parent &&
      ts.isVariableDeclaration(node.parent) &&
      ts.isIdentifier(node.parent.name)
    ) {
      return node.parent.name.text;
    } else if (ts.isMethodDeclaration(node) && ts.isIdentifier(node.name)) {
      return node.name.text;
    }
    return null;
  }

  private extractCalls(body: string): Set<string> {
    const regex = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
    regex.lastIndex = 0;
    const calls = new Set<string>();
    let match;
    while ((match = regex.exec(body)) !== null) {
      const fn = match[1];
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

  private estimateComplexity(body: string, functionName: string): TimeComplexity {
    const arrayOps = /\.map\(|\.forEach\(|\.filter\(|\.reduce\(|\.some\(|\.every\(/;
    const sortOps = /\.sort\(/;
    const loops = /\b(for|while)\s*\(/;

    const recursiveCallWithArgRegex = new RegExp(
      `\\b${functionName}\\s*\\(([^,)]*)\\)`,
      "g"
    );

    let complexity = TimeComplexity.CONSTANT;

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

    recursiveCallWithArgRegex.lastIndex = 0;
    let recursiveMatch;
    let isActuallyRecursive = false;
    let maxRecursiveComplexityFound = TimeComplexity.CONSTANT;

    while ((recursiveMatch = recursiveCallWithArgRegex.exec(body)) !== null) {
      isActuallyRecursive = true;
      const paramPassed = recursiveMatch[1] ? recursiveMatch[1].trim() : "";

      if (/\/\s*\d+/.test(paramPassed) || /\*\s*\d+/.test(paramPassed)) {
        maxRecursiveComplexityFound = this.getMaxComplexity(
          maxRecursiveComplexityFound,
          TimeComplexity.Quadratic
        );
      } else if (/\s*-\s*\d+/.test(paramPassed) || /\s*\+\s*\d+/.test(paramPassed)) {
        maxRecursiveComplexityFound = this.getMaxComplexity(
          maxRecursiveComplexityFound,
          TimeComplexity.Linear
        );
      } else {
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
