import * as vscode from "vscode"
import { IdrisClient } from "idris-ide-client"
import { state } from "../state"
import { v2Only } from "../commands"
import { DocState, DocStateParser } from "./doc-state-parser"
import { isExtLanguage } from "../languages"

const lidrLineIsCode = (document: vscode.TextDocument, line: number): boolean =>
  document.lineAt(line).text.trim().startsWith(">")

const openingMarkdownBlock = (line: string): boolean => /^(```|~~~)idris/.test(line.trim())
const closingMarkdownBlock = (line: string): boolean => /^(```|~~~)\s*$/.test(line.trim())

const getStateWithinBlock = (
  document: vscode.TextDocument,
  position: vscode.Position,
  startLine: number,
  endLine: number
): DocState => {
  const blockStart = new vscode.Position(startLine, 0)
  const blockEnd = new vscode.Position(endLine, 0)
  const block = new vscode.Range(blockStart, blockEnd)
  const relativePos = new vscode.Position(position.line - startLine, position.character)
  const parser = new DocStateParser(document.getText(block), relativePos)
  return parser.parseToEndPos()
}
/**
 * The, perhaps imperfectly named, DocStateParser determines whether the cursor is
 * over code within a source file. For literate Idris and markdown files, we first
 * need to determine if we’re within a code block at all. If so, we pass just that
 * code block to the DocStateParser, to see if within that block the cursor is
 * pointing at code.
 */
const overCode = (document: vscode.TextDocument, position: vscode.Position): boolean => {
  const lang = document.languageId
  if (!isExtLanguage(lang)) return false

  switch (lang) {
    case "idris2":
    case "idris": {
      const parser = new DocStateParser(document.getText(), position)
      const docStateAtPos = parser.parseToEndPos()
      return docStateAtPos === "code"
    }
    case "lidr": {
      const inCodeBlock = lidrLineIsCode(document, position.line)
      if (!inCodeBlock) return false

      // Run the DocStateParser on just the code block that the hover position is within.
      let blockStartLine = position.line
      let blockEndLine = position.line
      while (lidrLineIsCode(document, blockStartLine) && blockStartLine > 0) blockStartLine--
      while (lidrLineIsCode(document, blockEndLine) && blockEndLine <= document.lineCount) blockEndLine++

      return getStateWithinBlock(document, position, blockStartLine, blockEndLine + 1) === "code"
    }
    case "markdown": {
      const hoverLineText = document.lineAt(position.line).text
      // If we’re over a markdown code block delimeter, it’s not Idris code.
      if (openingMarkdownBlock(hoverLineText) || closingMarkdownBlock(hoverLineText)) return false

      // Look for opening of Idris code block.
      let blockStartLine = position.line
      while (blockStartLine > 0) {
        blockStartLine--
        const lineText = document.lineAt(blockStartLine).text
        if (openingMarkdownBlock(lineText)) break
        if (closingMarkdownBlock(lineText)) return false // we’re not in a code block
      }
      if (blockStartLine === 0) return false // we’ve reached the start without finding the opening of a code block

      // If we’ve gotten this far, we’re definitely within a code block.
      let blockEndLine = position.line
      while (blockEndLine <= document.lineCount) {
        blockEndLine++
        const lineText = document.lineAt(blockStartLine).text
        if (closingMarkdownBlock(lineText)) break
      }
      return getStateWithinBlock(document, position, blockStartLine + 1, blockEndLine) === "code"
    }
  }
}

const typeOf =
  (client: IdrisClient) =>
  (document: vscode.TextDocument, position: vscode.Position): Promise<string | null> =>
    new Promise(async (res) => {
      const range = document.getWordRangeAtPosition(position)
      if (!range) return res(null)
      if (!overCode(document, position)) return res(null)

      const name = document.getText(range)
      const trimmed = name.startsWith("?") ? name.slice(1, name.length) : name
      const reply = await client.typeOf(trimmed)
      res(reply.ok ? reply.typeOf : null)
    })

const typeAt =
  (client: IdrisClient) =>
  (document: vscode.TextDocument, position: vscode.Position): Promise<string | null> =>
    new Promise(async (res) => {
      const range = document.getWordRangeAtPosition(position)
      if (!range) return res(null)
      if (!overCode(document, position)) return res(null)

      const name = document.getText(range)
      const trimmed = name.startsWith("?") ? name.slice(1, name.length) : name
      const reply = await client.typeAt(trimmed, position.line + 1, position.character + 1)
      res(reply.ok ? reply.typeAt : null)
    })

export class Provider implements vscode.HoverProvider {
  private typeOf: (document: vscode.TextDocument, position: vscode.Position) => Promise<string | null>
  private typeAt: (document: vscode.TextDocument, position: vscode.Position) => Promise<string | null>

  constructor(client: IdrisClient) {
    this.typeOf = typeOf(client)
    this.typeAt = typeAt(client)
  }

  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Hover> {
    switch (state.hoverAction) {
      case "Nothing":
        return null
      case "Type Of":
        return this.typeOf(document, position).then((type) =>
          type ? { contents: [{ value: type, language: "idris" }] } : null
        )
      case "Type At":
        if (!state.idris2Mode) {
          v2Only("Type At")
          return null
        }
        return this.typeAt(document, position).then((type) =>
          type ? { contents: [{ value: type, language: "idris" }] } : null
        )
    }
  }
}
