import * as vscode from "vscode"
import { InfoReply } from "idris-ide-client"
import { state } from "../state"
import { isAbsolute } from "path"
import { rmLocDesc } from "./diagnostic-utils"

const warningToDiagnostic = (reply: InfoReply.Warning): vscode.Diagnostic => {
  const { start, end, warning } = reply.err
  const range = new vscode.Range(
    new vscode.Position(start.line - 1, start.column - 1),
    new vscode.Position(end.line - 1, end.column)
  )
  const editedWarning = rmLocDesc(warning)
  return new vscode.Diagnostic(range, editedWarning)
}

export const handleWarning = (reply: InfoReply.Warning): void => {
  const { diagnostics, idrisProcDir } = state
  const filename = reply.err.filename

  // Idris2 sometimes uses relative file paths, which aren’t parsed into file URIs correctly on their own.
  if (isAbsolute(filename)) {
    const uri = vscode.Uri.file(filename)
    const existing = diagnostics.get(uri) || []
    diagnostics.set(uri, existing.concat(warningToDiagnostic(reply)))
  } else if (idrisProcDir) {
    const uri = vscode.Uri.file(idrisProcDir + "/" + filename)
    const existing = diagnostics.get(uri) || []
    diagnostics.set(uri, existing.concat(warningToDiagnostic(reply)))
  }
}
