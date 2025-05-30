import * as vscode from "vscode";

const supportedLanguages = [
  {
    name: "javascript",
    provider: () =>
      import("./providers/typescript_time_complexity_code_lens.provider.js"),
  },
  {
    name: "typescript",
    provider: () =>
      import("./providers/typescript_time_complexity_code_lens.provider.js"),
  },
];

export async function activate(context: vscode.ExtensionContext) {

  for (const language of supportedLanguages) {
    const { TimeComplexityCodeLensProvider } = await language.provider();
    context.subscriptions.push(
      vscode.languages.registerCodeLensProvider(
        { language: language.name },
        new TimeComplexityCodeLensProvider()
      )
    );
  }


}

export function deactivate() {}
