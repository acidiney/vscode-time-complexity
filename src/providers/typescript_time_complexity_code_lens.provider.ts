import * as vscode from "vscode";
import { AnalyzedFunction } from "../interfaces/analyzed-function.interface";
import { complexityOrder } from "../utils/complexity-order";
import { TimeComplexity } from "../enums/time-complexity.enum";
import ts from "typescript";

export class TimeComplexityCodeLensProvider implements vscode.CodeLensProvider {
    private static readonly BUILTIN_FUNCTIONS = new Set([
        // Control flow
        "if", "else", "for", "while", "do", "switch", "case", "break", "continue", "return", "throw", "try", "catch", "finally",
        // Built-in objects
        "console", "Math", "Array", "Object", "String", "Number", "Boolean", "Date", "RegExp", "JSON", "Promise", "Set", "Map",
        // Keywords
        "function", "class", "interface", "type", "enum", "const", "let", "var", "import", "export", "default", "extends", "implements",
        // Other
        "new", "this", "super", "typeof", "instanceof", "void", "delete", "in", "with", "yield", "await", "async"
    ]);

    private static readonly ARRAY_ITERATION_METHODS = new Set([
        'map', 'forEach', 'filter', 'reduce', 'reduceRight',
        'some', 'every', 'find', 'findIndex', 'flatMap'
    ]);

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
                tooltip: this.createTooltip(fn),
            });
        });
    }

    private createTooltip(fn: AnalyzedFunction): string {
        let tooltip = `Function: ${fn.name}\n`;
        tooltip += `Estimated Time Complexity: ${fn.complexity}\n`;
        if (fn.analysisDetails) {
            tooltip += `\nAnalysis Details:\n${fn.analysisDetails.join('\n')}`;
        }
        return tooltip;
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

                const analysisResult = this.analyzeFunctionWithAST(node, name, sourceFile);

                functions.push({
                    name,
                    body: bodyText,
                    position,
                    calls: analysisResult.calls,
                    complexity: analysisResult.complexity,
                    analysisDetails: analysisResult.analysisDetails
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


    private analyzeFunctionWithAST(
        node: ts.FunctionLikeDeclaration,
        functionName: string,
        sourceFile: ts.SourceFile
    ): { complexity: TimeComplexity; calls: Set<string>; analysisDetails: string[] } {
        const analysisDetails: string[] = [];
        const calls = new Set<string>();
        let maxLoopNesting = 0;
        let hasSortOps = false;
        let hasBinarySearchPattern = false;
        let recursiveComplexity = TimeComplexity.CONSTANT;
        let recursiveCallCount = 0;
        let hasMultipleRecursiveBranches = false;

        const visit = (n: ts.Node, context: { loopDepth: number; arrayMethodDepth: number } = { loopDepth: 0, arrayMethodDepth: 0 }) => {
            let newLoopDepth = context.loopDepth;
            let newArrayMethodDepth = context.arrayMethodDepth;

            // Track the maximum nesting level we encounter
            const currentTotalDepth = newLoopDepth + newArrayMethodDepth;
            maxLoopNesting = Math.max(maxLoopNesting, currentTotalDepth);

            // Check for traditional loops
            if (ts.isForStatement(n) || ts.isWhileStatement(n) || ts.isDoStatement(n)) {
                newLoopDepth++;
                analysisDetails.push(`Found loop at depth ${newLoopDepth}`);

                // Analyze loop condition
                this.analyzeLoopCondition(n, analysisDetails);
            }

            // Check for array iteration methods
            if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression)) {
                const methodName = n.expression.name.text;

                if (TimeComplexityCodeLensProvider.ARRAY_ITERATION_METHODS.has(methodName)) {
                    newArrayMethodDepth++;
                    analysisDetails.push(`Found array.${methodName} iteration at depth ${newArrayMethodDepth}`);
                }

                if (methodName === 'sort') {
                    hasSortOps = true;
                    analysisDetails.push('Found array sort operation (O(n log n))');
                }

                // Check for binary search pattern
                if (methodName === 'floor' &&
                    ts.isBinaryExpression(n.expression.expression) &&
                    n.expression.expression.operatorToken.kind === ts.SyntaxKind.SlashToken) {
                    hasBinarySearchPattern = true;
                }
            }

            // Check for recursive calls
            if (ts.isCallExpression(n) && ts.isIdentifier(n.expression)) {
                const calledFunction = n.expression.text;

                if (!TimeComplexityCodeLensProvider.BUILTIN_FUNCTIONS.has(calledFunction)) {
                    calls.add(calledFunction);
                }

                if (calledFunction === functionName) {
                    recursiveCallCount++;
                    analysisDetails.push(`Found recursive call to ${functionName}`);

                    const argComplexity = this.analyzeRecursiveArgument(n, sourceFile);
                    recursiveComplexity = this.getMaxComplexity(recursiveComplexity, argComplexity);
                    analysisDetails.push(`Recursive argument complexity: ${argComplexity}`);

                    if (recursiveCallCount > 1) {
                        hasMultipleRecursiveBranches = true;
                    }
                }
            }

            ts.forEachChild(n, (child) => visit(child, {
                loopDepth: newLoopDepth,
                arrayMethodDepth: newArrayMethodDepth
            }));
        };

        if (node.body) {
            visit(node.body);
        }

        // Determine complexity based on nesting levels
        let complexity = TimeComplexity.CONSTANT;
        let complexityReason = 'Base case: No loops or recursion';

        if (maxLoopNesting === 1) {
            complexity = TimeComplexity.Linear;
            complexityReason = 'Single loop or array iteration (O(n))';
        } else if (maxLoopNesting === 2) {
            complexity = TimeComplexity.Quadratic;
            complexityReason = 'Nested loops or array iterations (O(n²))';
        } else if (maxLoopNesting >= 3) {
            complexity = TimeComplexity.Cubic;
            complexityReason = `Triple nested loops (O(n³)) detected at depth ${maxLoopNesting}`;
        }

        // Handle binary search pattern
        if (hasBinarySearchPattern) {
            complexity = this.getMaxComplexity(complexity, TimeComplexity.Logarithmic);
            complexityReason = 'Binary search pattern detected (O(log n))';
        }

        // Handle sorting operations
        if (hasSortOps) {
            complexity = this.getMaxComplexity(complexity, TimeComplexity.Linearithmic);
            complexityReason = 'Sort operation detected (O(n log n))';
        }

        // Handle recursion
        if (recursiveCallCount > 0) {
            if (hasMultipleRecursiveBranches) {
                complexity = this.getMaxComplexity(complexity, TimeComplexity.Exponential);
                complexityReason = 'Multiple recursive branches (O(2ⁿ))';
            } else {
                complexity = this.getMaxComplexity(complexity, recursiveComplexity);
                complexityReason = `Single recursive branch with ${recursiveComplexity} pattern`;
            }
        }

        analysisDetails.unshift(`Final complexity determination: ${complexityReason}`);

        return {
            complexity,
            calls,
            analysisDetails
        };
    }

    private analyzeLoopCondition(loop: ts.IterationStatement, analysisDetails: string[]) {
        if (ts.isForStatement(loop)) {
            if (loop.condition && ts.isBinaryExpression(loop.condition)) {
                const conditionText = loop.condition.getText();
                analysisDetails.push(`Loop condition: ${conditionText}`);

                if (loop.condition.operatorToken.kind === ts.SyntaxKind.LessThanToken ||
                    loop.condition.operatorToken.kind === ts.SyntaxKind.LessThanEqualsToken) {
                    analysisDetails.push('Standard for-loop condition detected');
                }
            }
        } else if (ts.isWhileStatement(loop) || ts.isDoStatement(loop)) {
            if (ts.isBinaryExpression(loop.expression)) {
                analysisDetails.push(`Loop condition: ${loop.expression.getText()}`);
            }
        }
    }

    private analyzeRecursiveArgument(callNode: ts.CallExpression, sourceFile: ts.SourceFile): TimeComplexity {
        if (!callNode.arguments || callNode.arguments.length === 0) {
            return TimeComplexity.Exponential;
        }

        const firstArg = callNode.arguments[0];
        return this.analyzeArgumentExpression(firstArg);
    }

    private analyzeArgumentExpression(expr: ts.Expression): TimeComplexity {
        if (ts.isBinaryExpression(expr)) {
            const left = expr.left;
            const right = expr.right;
            const operator = expr.operatorToken.kind;

            // Check for n-1 or n+1 pattern (linear)
            if (ts.isIdentifier(left) && ts.isNumericLiteral(right)) {
                const numValue = parseFloat(right.text);
                if (operator === ts.SyntaxKind.MinusToken || operator === ts.SyntaxKind.PlusToken) {
                    if (numValue === 1) {
                        return TimeComplexity.Linear;
                    }
                }
            }

            // Check for n/2 pattern (logarithmic)
            if (ts.isIdentifier(left) && ts.isNumericLiteral(right)) {
                if (operator === ts.SyntaxKind.SlashToken) {
                    const denominator = parseFloat(right.text);
                    if (denominator > 1) {
                        return TimeComplexity.Logarithmic;
                    }
                }
            }

            // Check for n*2 pattern (logarithmic - inverse)
            if (ts.isIdentifier(left) && ts.isNumericLiteral(right)) {
                if (operator === ts.SyntaxKind.AsteriskToken) {
                    return TimeComplexity.Logarithmic;
                }
            }
        }

        if (ts.isParenthesizedExpression(expr)) {
            return this.analyzeArgumentExpression(expr.expression);
        }

        if (ts.isIdentifier(expr)) {
            return TimeComplexity.Linear;
        }

        if (ts.isPropertyAccessExpression(expr)) {
            return TimeComplexity.Linear;
        }

        if (ts.isElementAccessExpression(expr)) {
            return TimeComplexity.Linear;
        }

        return TimeComplexity.Exponential;
    }

  private resolveCallGraph(functions: AnalyzedFunction[]): void {
    const functionMap = new Map<string, AnalyzedFunction>();
    for (const fn of functions) {
        functionMap.set(fn.name, fn);
    }

    let changed: boolean;
    do {
        changed = false;
        for (const fn of functions) {
            let maxCallComplexity = fn.complexity
            for (const call of fn.calls) {
                const callee = functionMap.get(call);
                if (callee) {
                    // Get the maximum complexity from all called functions
                    maxCallComplexity = this.getMaxComplexity(maxCallComplexity, callee.complexity);
                }
            }

            const newComplexity = this.getMaxComplexity(fn.complexity, maxCallComplexity);

            // Only update if the new complexity is higher in the order
            if (complexityOrder.indexOf(newComplexity) > complexityOrder.indexOf(fn.complexity)) {
                fn.complexity = newComplexity;
                changed = true;
                if (fn.analysisDetails) {
                    fn.analysisDetails.push(
                        `Complexity updated from ${fn.complexity} to ${maxCallComplexity} ` +
                        `due to calls to: ${Array.from(fn.calls).join(', ')}`
                    );
                }
            }
        }
    } while (changed);
}

    private getMaxComplexity(...complexities: TimeComplexity[]): TimeComplexity {
        return complexities.reduce((max, curr) => {
            return complexityOrder.indexOf(curr) > complexityOrder.indexOf(max)
                ? curr
                : max;
        }, TimeComplexity.CONSTANT);
    }
}