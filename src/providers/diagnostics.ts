import * as vscode from "vscode"
import { InfoReply } from "idris-ide-client"
import { state } from "../state"

const warningToDiagnostic = (reply: InfoReply.Warning): vscode.Diagnostic => {
  const { start, end, warning } = reply.err
  const range = new vscode.Range(
    new vscode.Position(start.line - 1, start.column - 1),
    new vscode.Position(end.line - 1, end.column)
  )
  return new vscode.Diagnostic(range, warning)
}

export const handleWarning = (reply: InfoReply.Warning): void => {
  const { diagnostics } = state
  const filename = reply.err.filename
  const uri = vscode.Uri.file(filename)
  const existing = diagnostics.get(uri) || []
  diagnostics.set(uri, existing.concat(warningToDiagnostic(reply)))
}
