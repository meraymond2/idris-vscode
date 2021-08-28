import * as vscode from "vscode"
import {
  addClause,
  addMissing,
  apropos,
  aproposSelection,
  browseNamespace,
  caseSplit,
  docsFor,
  docsForSelection,
  evalResult,
  generateDef,
  interpretSelection,
  loadFile,
  makeCase,
  makeLemma,
  makeWith,
  metavariables,
  printDefinition,
  printDefinitionSelection,
  proofSearch,
  version,
} from "./commands"
import * as completions from "./providers/completions"

import * as hover from "./providers/hover"
import * as messageHighlighting from "./providers/message-highlighting"
import * as virtualDocs from "./providers/virtual-docs"
import { AutoSaveBehaviour, HoverBehaviour, initialiseState, state, supportedLanguages } from "./state"

const promptReload = () => {
  const action = "Reload Now"

  vscode.window
    .showInformationMessage("Reload window in order for configuration changes to take effect.", action)
    .then((selectedAction) => {
      if (selectedAction === action) {
        vscode.commands.executeCommand("workbench.action.reloadWindow")
      }
    })
}

export const activate = (context: vscode.ExtensionContext) => {
  initialiseState()
  const { client, diagnostics, virtualDocState } = state
  if (client === null) {
    throw "Client should have been initialised by this point."
  }

  // Activate the provider for all supported language ids.
  const selectSupported = supportedLanguages(state).map((language) => ({ language }))

  vscode.workspace.onDidChangeConfiguration((changeEvent: vscode.ConfigurationChangeEvent) => {
    if (changeEvent.affectsConfiguration("idris.autosave")) {
      const autosave: AutoSaveBehaviour | undefined = vscode.workspace.getConfiguration("idris").get("autosave")
      if (autosave) state.autosave = autosave
    }
    if (changeEvent.affectsConfiguration("idris.hoverAction")) {
      const hoverAction: HoverBehaviour | undefined = vscode.workspace.getConfiguration("idris").get("hoverAction")
      if (hoverAction) state.hoverAction = hoverAction
    }
    const procConfigChanged =
      changeEvent.affectsConfiguration("idris.idrisPath") || changeEvent.affectsConfiguration("idris.idris2Mode")
    if (procConfigChanged) {
      promptReload()
    }
  })

  vscode.workspace.registerTextDocumentContentProvider(virtualDocs.scheme, virtualDocs.provider)

  vscode.languages.registerDocumentSemanticTokensProvider(
    messageHighlighting.selector,
    messageHighlighting.provider,
    messageHighlighting.legend
  )

  vscode.languages.registerCompletionItemProvider(selectSupported, new completions.Provider(client))

  vscode.languages.registerHoverProvider(selectSupported, new hover.Provider(client))

  vscode.window.visibleTextEditors.forEach((editor) => loadFile(client, editor.document))

  /* Hooks */
  const syncFileInfo = (document: vscode.TextDocument) => {
    // Clear old state
    diagnostics.delete(document.uri)
    vscode.window.activeTextEditor?.setDecorations(evalResult, [])

    // Get new state
    loadFile(client, document)
  }

  vscode.workspace.onDidOpenTextDocument(syncFileInfo)

  vscode.workspace.onDidSaveTextDocument(syncFileInfo)

  vscode.workspace.onDidCloseTextDocument((document: vscode.TextDocument) => {
    diagnostics.delete(document.uri)
    delete virtualDocState[document.uri.path]
  })

  /* Commands */
  context.subscriptions.push(
    vscode.commands.registerCommand("idris.activate", () => {
      if (vscode.window.activeTextEditor) syncFileInfo(vscode.window.activeTextEditor.document)
    })
  )

  context.subscriptions.push(vscode.commands.registerCommand("idris.addClause", addClause(client)))

  context.subscriptions.push(vscode.commands.registerCommand("idris.addMissing", addMissing(client)))

  context.subscriptions.push(vscode.commands.registerCommand("idris.apropos", apropos(client)))

  context.subscriptions.push(vscode.commands.registerCommand("idris.aproposSelection", aproposSelection(client)))

  context.subscriptions.push(vscode.commands.registerCommand("idris.browseNamespace", browseNamespace(client)))

  context.subscriptions.push(vscode.commands.registerCommand("idris.caseSplit", caseSplit(client)))

  context.subscriptions.push(vscode.commands.registerCommand("idris.docsFor", docsFor(client)))

  context.subscriptions.push(vscode.commands.registerCommand("idris.docsForSelection", docsForSelection(client)))

  context.subscriptions.push(vscode.commands.registerCommand("idris.generateDef", generateDef(client)))

  context.subscriptions.push(vscode.commands.registerCommand("idris.interpretSelection", interpretSelection(client)))

  context.subscriptions.push(vscode.commands.registerCommand("idris.metavariables", metavariables(client)))

  context.subscriptions.push(vscode.commands.registerCommand("idris.printDefinition", printDefinition(client)))

  context.subscriptions.push(
    vscode.commands.registerCommand("idris.printDefinitionSelection", printDefinitionSelection(client))
  )

  context.subscriptions.push(vscode.commands.registerCommand("idris.makeCase", makeCase(client)))

  context.subscriptions.push(vscode.commands.registerCommand("idris.makeLemma", makeLemma(client)))

  context.subscriptions.push(vscode.commands.registerCommand("idris.makeWith", makeWith(client)))

  context.subscriptions.push(vscode.commands.registerCommand("idris.proofSearch", proofSearch(client)))

  context.subscriptions.push(vscode.commands.registerCommand("idris.version", version(client)))
}

export const deactivate = () => {
  state.idrisProc?.kill()
}
