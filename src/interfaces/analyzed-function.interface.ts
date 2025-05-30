import type { Position } from "vscode";
import { TimeComplexity } from "../enums/time-complexity.enum";

export interface AnalyzedFunction {
  name: string;
  body: string;
  position: Position;
  calls: Set<string>;
  complexity: TimeComplexity;
}
