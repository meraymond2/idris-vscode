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

  const workspacePaths = vscode.workspace.workspaceFolders?.map(
    (folder) => folder.uri.path
  )

  /* Idris2 won’t locate the ipkg file by default if the code is in another
  directory, so it’s necessary to pass the --find-ipkg flag. It looks for the ipkg
  in parent directories of the process, so it’s also necessary to start the Idris
  process in the workspace directory.*/
  const procArgs = idris2Mode ? ["--ide-mode", "--find-ipkg"] : ["--ide-mode"]
  const procOpts =
    idris2Mode && workspacePaths?.length === 1 ? { cwd: workspacePaths[0] } : {}
  const idrisProc = spawn(idrisPath, procArgs, procOpts)

  idrisProc.on("error", (_) => {
    vscode.window.showErrorMessage(
      "Could not start Idris process with: " + idrisPath
    )
  })

  if (!(idrisProc.stdin && idrisProc.stdout)) {
    throw "Failed to start Idris process." // unreachable
  }

  const client = new IdrisClient(idrisProc.stdin, idrisProc.stdout, {
    debug: false,
    replyCallback,
  })

  state.idrisProc = idrisProc
  state.client = client
}
