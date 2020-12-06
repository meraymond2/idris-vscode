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
  const { diagnostics, idrisProcDir, idris2Mode } = state
  const filename = reply.err.filename

  // Idris2 uses relative file paths, which aren’t parsed into file URIs correctly on their own.
  if (idris2Mode && idrisProcDir) {
    const uri = vscode.Uri.file(idrisProcDir + "/" + filename)
    const existing = diagnostics.get(uri) || []
    diagnostics.set(uri, existing.concat(warningToDiagnostic(reply)))
  } else {
    const uri = vscode.Uri.file(filename)
    const existing = diagnostics.get(uri) || []
    diagnostics.set(uri, existing.concat(warningToDiagnostic(reply)))
  }
}
