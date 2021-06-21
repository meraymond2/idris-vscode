import * as vscode from "vscode"
import { MessageMetadata } from "idris-ide-client"
import { scheme } from "./virtual-docs"
import { state } from "../state"

// * In short, each token takes 5 integers to represent, so a specific token `i` in the file consists of the following array indices:
// *  - at index `5*i`   - `deltaLine`: token line number, relative to the previous token
// *  - at index `5*i+1` - `deltaStart`: token start character, relative to the previous token (relative to 0 or the previous token's start if they are on the same line)
// *  - at index `5*i+2` - `length`: the length of the token. A token cannot be multiline.
// *  - at index `5*i+3` - `tokenType`: will be looked up in `SemanticTokensLegend.tokenTypes`. We currently ask that `tokenType` < 65536.
// *  - at index `5*i+4` - `tokenModifiers`: each set bit will be looked up in `SemanticTokensLegend.tokenModifiers`
// * ---
interface VSToken {
  deltaLine: number
  deltaStart: number
  length: number
  tokenType: number
  tokenModifiers: 0
}

const flattenToken = (token: VSToken): number[] => [
  token.deltaLine,
  token.deltaStart,
  token.length,
  token.tokenType,
  token.tokenModifiers,
]

const tokenTypes = ["enum", "function", "macro", "namespace", "type", "variable", "variable.readonly"]

const tokenModifiers = ["declaration"]

const decorToSelectorIndex = {
  ":bound": tokenTypes.indexOf("variable"),
  ":data": tokenTypes.indexOf("enum"),
  ":function": tokenTypes.indexOf("function"),
  ":keyword": tokenTypes.indexOf("variable.readonly"),
  ":module": tokenTypes.indexOf("namespace"),
  ":metavar": tokenTypes.indexOf("macro"),
  ":type": tokenTypes.indexOf("type"),
}

/**
 * Idris labels message metadata by its position relative to the start of the
 * string, treating new lines as any other char. VS labels its tokens relative
 * to the previous token, by line and char. This function converts from the
 * Idris system to VS.
 */
export const metadataToTokens = (text: string, metadata: MessageMetadata[]): Uint32Array => {
  let tokenData: number[] = []
  let pos = 0
  let line = 0
  let char = 0
  let lastTokenLine = line
  let lastTokenStart = char
  metadata.forEach((m) => {
    /// walk forward until start of meta token
    while (pos < m.start) {
      if (text[pos] === "\n") {
        line += 1
        char = 0
      } else {
        char += 1
      }
      pos += 1
    }

    /// save this token
    const deltaLine = line - lastTokenLine
    const deltaStart = line === lastTokenLine ? char - lastTokenStart : char

    const token: VSToken = {
      deltaLine,
      deltaStart,
      length: m.length,
      tokenType: decorToSelectorIndex[m.metadata.decor || ":bound"],
      tokenModifiers: 0,
    }
    tokenData = tokenData.concat(flattenToken(token))

    /// update last token state
    lastTokenLine = line
    lastTokenStart = char

    /// walk through meta token
    while (pos < m.start + m.length) {
      if (text[pos] === "\n") {
        // VS doesn’t accept multi-line tokens. I’m not sure if Idris will ever return one.
        throw "Blast and damn, these aren’t supposed to cross lines."
      } else {
        char += 1
      }
      pos += 1
    }
  })

  return new Uint32Array(tokenData)
}

export const legend = new vscode.SemanticTokensLegend(tokenTypes, tokenModifiers)

export const provider: vscode.DocumentSemanticTokensProvider = {
  provideDocumentSemanticTokens(document: vscode.TextDocument): vscode.ProviderResult<vscode.SemanticTokens> {
    const info = state.virtualDocState[document.uri.path]
    return new Promise((resolve) => {
      if (info) {
        const { text, metadata } = info
        const tokenData = metadataToTokens(text, metadata)
        resolve(new vscode.SemanticTokens(tokenData))
      } else resolve(new vscode.SemanticTokens(new Uint32Array()))
    })
  },
}

/**
 * Match documents with the Virtual Document scheme.
 */
export const selector = { scheme }
