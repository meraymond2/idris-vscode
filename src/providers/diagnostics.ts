import { extname, join, isAbsolute } from "path"
import * as vscode from "vscode"
import { InfoReply } from "idris-ide-client"
import { state } from "../state"

const warningToDiagnostic = (reply: InfoReply.Warning): vscode.Diagnostic =>
  new vscode.Diagnostic(diagnosticRange(reply), rmLocDesc(reply.err.warning))

const diagnosticRange = (reply: InfoReply.Warning): vscode.Range => {
  const { start, end, filename } = reply.err
  const isLidr = extname(filename) === ".lidr"
  const { idris2Mode } = state
  // In Idris 2 0.6.0, the positions returned by the IDE process were updated to
  // be 0-indexed like VS. Also in Idris2, .lidr positions are returned as if
  // they’re normal Idris files, so they’re off by two, for the `> ` at the
  // beginning. In Idris 1, .lidr files are correctly indexed, but all
  // positions are 1-indexed.
  return idris2Mode
    ? isLidr
      ? new vscode.Range(
          new vscode.Position(start.line, start.column + 2),
          new vscode.Position(end.line, end.column + 2)
        )
      : new vscode.Range(new vscode.Position(start.line, start.column), new vscode.Position(end.line, end.column))
    : new vscode.Range(
        new vscode.Position(start.line - 1, start.column - 1),
        new vscode.Position(end.line - 1, end.column)
      )
}

const filenameRegex = /.*:\d+:\d+--\d+:\d+\n(.|\n)*?(\n\n|\n$)/
const parseLineRegex = /Parse error at line \d+:\d+:\n/

const rmFileSec = (warning: string) => warning.replace(filenameRegex, "")

const rmParseLine = (warning: string) => warning.replace(parseLineRegex, "")

const rmLocDesc = (warning: string) => rmFileSec(rmParseLine(warning)).trim()

export const handleWarning = (reply: InfoReply.Warning): void => {
  const { diagnostics, idrisProcDir } = state
  const filename = reply.err.filename

  // Idris2 sometimes uses relative file paths, which aren’t parsed into file URIs correctly on their own.
  const uri = isAbsolute(filename) ? vscode.Uri.file(filename) : vscode.Uri.file(join(idrisProcDir || "", filename))
  const existing = diagnostics.get(uri) || []
  diagnostics.set(uri, existing.concat(warningToDiagnostic(reply)))
}
