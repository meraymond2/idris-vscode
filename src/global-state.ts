// This is a little hacky, but the Memento API is too clunky.

import * as vscode from "vscode"
import { VirtualDocInfo } from "./providers/virtual-docs"

export const virtualDocState: Record<string, VirtualDocInfo> = {}

export const diagnostics = vscode.languages.createDiagnosticCollection(
  "Idris Errors"
)
