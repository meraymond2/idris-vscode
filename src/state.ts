import { ChildProcess, spawn } from "child_process"
import { IdrisClient, Reply } from "idris-ide-client"
import * as vscode from "vscode"
import { ExtLanguage } from "./languages"
import { handleWarning } from "./providers/diagnostics"
import { VirtualDocInfo } from "./providers/virtual-docs"
import { extractPkgs } from "./ipkg"

// I’m not using the Memento API because I don’t want persistence across sessions, and I do want type-safety.

export type AutoSaveBehaviour = "always" | "prompt" | "never"
export type HoverBehaviour = "Type Of" | "Type At" | "Nothing"

export interface State {
  autosave: AutoSaveBehaviour
  client: IdrisClient | null
  currentFile: string
  diagnostics: vscode.DiagnosticCollection
  hoverAction: HoverBehaviour
  idrisProc: ChildProcess | null
  idrisProcDir: string | null
  idris2Mode: boolean
  outputChannel: vscode.OutputChannel
  statusMessage: vscode.Disposable | null
  virtualDocState: Record<string, VirtualDocInfo>
}

export const state: State = {
  autosave: "always",
  client: null,
  currentFile: "",
  diagnostics: vscode.languages.createDiagnosticCollection("Idris Errors"),
  hoverAction: "Type Of",
  idrisProc: null,
  idrisProcDir: null,
  idris2Mode: false,
  outputChannel: vscode.window.createOutputChannel("Idris"),
  statusMessage: null,
  virtualDocState: {},
}

const replyCallback = (reply: Reply): void => {
  switch (reply.type) {
    case ":warning":
      return handleWarning(reply)
    default:
  }
}

export const initialiseState = async () => {
  const extensionConfig = vscode.workspace.getConfiguration("idris")
  const idrisPath: string = extensionConfig.get("idrisPath") || ""
  const idris2Mode: boolean = extensionConfig.get("idris2Mode") || false
  const autosave: AutoSaveBehaviour | undefined = extensionConfig.get("autosave")
  const hoverAction: HoverBehaviour | undefined = extensionConfig.get("hoverAction")

  const workspacePaths = vscode.workspace.workspaceFolders?.map((folder) => folder.uri.path)
  let idrisProcDir = null
  if (workspacePaths?.length === 1) {
    idrisProcDir = workspacePaths[0]
  } else {
    vscode.window.showErrorMessage("Multiple workspaces are not currently supported, and most features may not work correctly.")
  }

  /* Idris2 won’t locate the ipkg file by default if the code is in another
  directory, so it’s necessary to pass the --find-ipkg flag. It looks for the ipkg
  in parent directories of the process, so it’s also necessary to start the Idris
  process in the workspace directory.*/
  const procArgs = idris2Mode ? ["--ide-mode", "--find-ipkg", "--no-color"] : ["--ide-mode"]

  if (!idris2Mode) {
    const ipkgUries = await vscode.workspace.findFiles("*.ipkg")

    if (ipkgUries.length > 0) {
      const ipkgFile = await readFile(ipkgUries[0])
      const pkgs = extractPkgs(ipkgFile)
      pkgs.forEach((pkg) => procArgs.push("-p", pkg))
    }
  }

  const procOpts = idrisProcDir ? { cwd: idrisProcDir } : {}
  const idrisProc = spawn(idrisPath, procArgs, procOpts)

  idrisProc.on("error", (_) => {
    vscode.window.showErrorMessage("Could not start Idris process with: " + idrisPath)
  })

  if (!(idrisProc.stdin && idrisProc.stdout)) {
    throw "Failed to start Idris process." // unreachable
  }

  const client = new IdrisClient(idrisProc.stdin, idrisProc.stdout, {
    debug: false,
    replyCallback,
  })

  state.client = client
  state.idrisProc = idrisProc
  state.idrisProcDir = idrisProcDir
  state.idris2Mode = idris2Mode
  if (autosave) state.autosave = autosave
  if (hoverAction) state.hoverAction = hoverAction
}

export const supportedLanguages = (state: State): ExtLanguage[] =>
  state.idris2Mode ? ["idris", "lidr", "markdown"] : ["idris", "lidr"]

const readFile = async (uri: vscode.Uri): Promise<string> => {
  const readData = await vscode.workspace.fs.readFile(uri)
  const data = Buffer.from(readData).toString("utf8")
  return data
}
