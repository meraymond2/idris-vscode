import * as vscode from "vscode"
import { IdrisClient, Decor } from "idris-ide-client"

const decorToKind = (decor: Decor): vscode.CompletionItemKind => {
  switch (decor) {
    case ":bound":
      return vscode.CompletionItemKind.Variable
    case ":data":
      return vscode.CompletionItemKind.Enum
    case ":function":
      return vscode.CompletionItemKind.Function
    case ":keyword":
      return vscode.CompletionItemKind.Keyword
    case ":metavar":
      return vscode.CompletionItemKind.Variable
    case ":module":
      return vscode.CompletionItemKind.Module
    case ":type":
      return vscode.CompletionItemKind.TypeParameter
  }
}

export class Provider implements vscode.CompletionItemProvider {
  private client: IdrisClient

  constructor(client: IdrisClient) {
    this.client = client
  }

  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken,
    _context: vscode.CompletionContext
  ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    const range = document.getWordRangeAtPosition(position)
    const name = document.getText(range)
    return new Promise(async (res) => {
      const reply = await this.client.replCompletions(name)
      const completions = reply.completions.map(
        (completion) => new vscode.CompletionItem(completion, vscode.CompletionItemKind.Function)
      )
      res(completions)
    })
  }

  resolveCompletionItem(
    item: vscode.CompletionItem,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.CompletionItem> {
    return new Promise(async (resolve) => {
      const reply = await this.client.docsFor(item.label, ":overview")
      if (reply.ok) {
        item.documentation = reply.docs

        // The first line of the docs is the identifier itself, so the first
        // item of metadata is the type.
        const decor = reply.metadata[0]?.metadata?.decor || ":function"
        item.kind = decorToKind(decor)
      }
      resolve(item)
    })
  }
}
