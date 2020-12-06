import { ChildProcess, spawn } from "child_process"
import { IdrisClient, Reply } from "idris-ide-client"
import * as vscode from "vscode"
import { handleWarning } from "./providers/diagnostics"
import { VirtualDocInfo } from "./providers/virtual-docs"

// I’m not using the Memento API because I don’t want persistence across sessions, and I do want type-safety.

export interface State {
  client: IdrisClient | null
  diagnostics: vscode.DiagnosticCollection
  idrisProc: ChildProcess | null
  virtualDocState: Record<string, VirtualDocInfo>
}

export const state: State = {
  client: null,
  diagnostics: vscode.languages.createDiagnosticCollection("Idris Errors"),
  idrisProc: null,
  virtualDocState: {},
}

const replyCallback = (reply: Reply): void => {
  switch (reply.type) {
    case ":warning":
      return handleWarning(reply)
    default:
  }
}

export const initialiseState = () => {
  const extensionConfig = vscode.workspace.getConfiguration("idris")
  const idrisPath: string = extensionConfig.get("idrisPath") || ""
  const idris2Mode: boolean = extensionConfig.get("idris2Mode") || false

  const procArgs = idris2Mode ? ["--ide-mode", "--find-ipkg"] : ["--ide-mode"]
  const idrisProc = spawn(idrisPath, procArgs)

  idrisProc.on("error", (_) => {
    vscode.window.showErrorMessage(
      "Could not start Idris process with: " + idrisPath
    )
  })

  if (!(idrisProc.stdin && idrisProc.stdout)) {
    throw "Failed to start Idris process." // unreachable
  }

  const client = new IdrisClient(idrisProc.stdin, idrisProc.stdout, {
    debug: true,
    replyCallback,
  })

  state.idrisProc = idrisProc
  state.client = client
}
