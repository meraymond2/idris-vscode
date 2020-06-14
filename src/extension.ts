import * as vscode from "vscode"
import { IdrisClient, Reply } from "idris-ide-client"
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
import { virtualDocState, diagnostics } from "./global-state"
import * as completions from "./providers/completions"
import { handleWarning } from "./providers/diagnostics"
import * as hover from "./providers/hover"
import * as messageHighlighting from "./providers/message-highlighting"
import * as virtualDocs from "./providers/virtual-docs"

let client: IdrisClient

const replyCallback = (reply: Reply): void => {
  switch (reply.type) {
    case ":warning":
      return handleWarning(reply)
    default:
  }
}

export const activate = (context: vscode.ExtensionContext) => {
  /* Initialisation */
  const config = vscode.workspace.getConfiguration("idris")

  client = new IdrisClient({
    debug: false,
    idrisPath: config.idrisPath,
    replyCallback,
  })

  vscode.workspace.registerTextDocumentContentProvider(
    virtualDocs.scheme,
    virtualDocs.provider
  )

  vscode.languages.registerDocumentSemanticTokensProvider(
    messageHighlighting.selector,
    messageHighlighting.provider,
    messageHighlighting.legend
  )

  vscode.languages.registerCompletionItemProvider(
    completions.selector,
    new completions.Provider(client)
  )

  vscode.languages.registerHoverProvider(
    hover.selector,
    new hover.Provider(client)
  )

  vscode.window.visibleTextEditors.forEach((editor) =>
    loadFile(client, editor.document)
  )

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
    vscode.commands.registerCommand("idris.addClause", addClause(client))
  )

  context.subscriptions.push(
    vscode.commands.registerCommand("idris.addMissing", addMissing(client))
  )

  context.subscriptions.push(
    vscode.commands.registerCommand("idris.apropos", apropos(client))
  )

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "idris.aproposSelection",
      aproposSelection(client)
    )
  )

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "idris.browseNamespace",
      browseNamespace(client)
    )
  )

  context.subscriptions.push(
    vscode.commands.registerCommand("idris.caseSplit", caseSplit(client))
  )

  context.subscriptions.push(
    vscode.commands.registerCommand("idris.docsFor", docsFor(client))
  )

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "idris.docsForSelection",
      docsForSelection(client)
    )
  )

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "idris.interpretSelection",
      interpretSelection(client)
    )
  )

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "idris.metavariables",
      metavariables(client)
    )
  )

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "idris.printDefinition",
      printDefinition(client)
    )
  )

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "idris.printDefinitionSelection",
      printDefinitionSelection(client)
    )
  )

  context.subscriptions.push(
    vscode.commands.registerCommand("idris.makeCase", makeCase(client))
  )

  context.subscriptions.push(
    vscode.commands.registerCommand("idris.makeLemma", makeLemma(client))
  )

  context.subscriptions.push(
    vscode.commands.registerCommand("idris.makeWith", makeWith(client))
  )

  context.subscriptions.push(
    vscode.commands.registerCommand("idris.proofSearch", proofSearch(client))
  )

  context.subscriptions.push(
    vscode.commands.registerCommand("idris.version", version(client))
  )
}

export const deactivate = () => {
  client.close()
}
