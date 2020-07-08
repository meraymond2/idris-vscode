import * as vscode from "vscode"
import { MessageMetadata } from "idris-ide-client"
import { virtualDocState } from "../global-state"

export type VirtualDocInfo = {
  text: string
  metadata: MessageMetadata[]
}

/**
 * The content is generated previously when the command is run that opens the
 * virtual doc. This is necessary because that info is also required by the provider
 * that generates the semantic highlighting.
 */
export const provider: vscode.TextDocumentContentProvider = {
  provideTextDocumentContent(uri: vscode.Uri): string {
    const info = virtualDocState[uri.path]
    return info ? info.text : ""
  },
}

export const scheme = "idris"
