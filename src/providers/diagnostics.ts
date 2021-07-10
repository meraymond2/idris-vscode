import { extname, isAbsolute } from "path"
import * as vscode from "vscode"
import { InfoReply } from "idris-ide-client"
import { state } from "../state"
import { rmLocDesc } from "./diagnostic-utils"

const warningToDiagnostic = (reply: InfoReply.Warning): vscode.Diagnostic => {
  const { start, end, warning, filename } = reply.err
  const isLidr = extname(filename) === ".lidr"
  // .lidr positions are returned as if they’re normal Idris files, so they’re
  // off by two, for the `> ` at the beginning.
  const range = isLidr
    ? new vscode.Range(
        new vscode.Position(start.line - 1, start.column + 1),
        new vscode.Position(end.line - 1, end.column + 2)
      )
    : new vscode.Range(
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
  const uri = isAbsolute(filename) ? vscode.Uri.file(filename) : vscode.Uri.file(idrisProcDir + "/" + filename)
  const existing = diagnostics.get(uri) || []
  diagnostics.set(uri, existing.concat(warningToDiagnostic(reply)))
}
