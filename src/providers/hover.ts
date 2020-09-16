import * as vscode from "vscode"
import { IdrisClient } from "idris-ide-client"
export const selector = { language: "idris" }

export class Provider implements vscode.HoverProvider {
  private client: IdrisClient

  constructor(client: IdrisClient) {
    this.client = client
  }

  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Hover> {
    return new Promise(async (res) => {
      const range = document.getWordRangeAtPosition(position)
      if (!range) res(null)
      const name = document.getText(range)
      const reply = await this.client.typeOf(name)
      if (reply.ok) {
        res({ contents: [{ value: reply.typeOf, language: "idris" }] })
      } else {
        res(null)
      }
    })
  }
}
