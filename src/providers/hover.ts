import * as vscode from "vscode"
import { IdrisClient } from "idris-ide-client"
import { state } from "../state"
import { v2Only } from "../commands"
export const selector = { language: "idris" }

type DocState =
  | "code" // abc
  | "line-comment" // -- abc
  | "block-comment" // {- abc -}
  | "doc-comment" // ||| abc
  | "string" // "abc"
  | "multi-line-string" // """abc"""

type Delimiter =
  | "string-delim"
  | "multi-line-string-delim"
  | "new-line"
  | "start-line-comment"
  | "start-block-comment"
  | "end-block-comment"
  | "start-doc-comment"

class DocStateParser {
  private text: string
  private endPos: vscode.Position
  private state: DocState
  private line: number // current line number in document
  private col: number // current column number on current line
  private pos: number // position in text-string

  constructor(text: string, endPos: vscode.Position) {
    this.text = text
    this.endPos = endPos
    this.state = "code"
    this.line = 0
    this.col = 0
    this.pos = 0

    this.consumeNextDelim = this.consumeNextDelim.bind(this)
    this.atEndPos = this.atEndPos.bind(this)
    this.incLine = this.incLine.bind(this)
    this.parseToEndPos = this.parseToEndPos.bind(this)
  }

  static nextState(currentState: DocState, delim: Delimiter): DocState {
    switch (currentState) {
      case "code":
        switch (delim) {
          case "string-delim":
            return "string"
          case "multi-line-string-delim":
            return "multi-line-string"
          case "start-line-comment":
            return "line-comment"
          case "start-block-comment":
            return "block-comment"
          case "start-doc-comment":
            return "doc-comment"
          default:
            return "code"
        }
      case "line-comment":
        switch (delim) {
          case "new-line":
            return "code"
          default:
            return "line-comment"
        }
      case "block-comment":
        switch (delim) {
          case "end-block-comment":
            return "code"
          default:
            return "block-comment"
        }
      case "doc-comment":
        switch (delim) {
          case "new-line":
            return "code"
          default:
            return "doc-comment"
        }
      case "string":
        switch (delim) {
          case "string-delim":
            return "code"
          default:
            return "string"
        }
      case "multi-line-string":
        switch (delim) {
          case "multi-line-string-delim":
            return "code"
          default:
            return "multi-line-string"
        }
    }
  }

  incLine(): void {
    this.line += 1
    this.col = 0
  }

  consumeNextDelim(): Delimiter | null {
    switch (this.state) {
      case "code": {
        if (
          this.text[this.pos] === '"' &&
          this.text[this.pos + 1] === '"' &&
          this.text[this.pos + 2] === '"'
        ) {
          this.pos += 3
          this.col += 3
          return "multi-line-string-delim"
        } else if (this.text[this.pos] === '"') {
          this.pos += 1
          this.col += 1
          return "string-delim"
        } else if (
          this.text[this.pos] === "-" &&
          this.text[this.pos + 1] === "-"
        ) {
          this.pos += 2
          this.col += 2
          return "start-line-comment"
        } else if (
          this.text[this.pos] === "{" &&
          this.text[this.pos + 1] === "-"
        ) {
          this.pos += 2
          this.col += 2
          return "start-block-comment"
        } else if (
          this.text[this.pos] === "|" &&
          this.text[this.pos + 1] === "|" &&
          this.text[this.pos + 2] === "|"
        ) {
          this.pos += 3
          this.col += 3
          return "start-doc-comment"
        } else return null
      }
      case "line-comment": {
        if (this.text[this.pos] === "\n") {
          this.incLine()
          this.pos += 1
          return "new-line"
        } else {
          return null
        }
      }
      case "block-comment": {
        if (this.text[this.pos] === "-" && this.text[this.pos + 1] === "}") {
          this.pos += 2
          this.col += 2
          return "end-block-comment"
        } else {
          return null
        }
      }
      case "doc-comment": {
        if (this.text[this.pos] === "\n") {
          this.incLine()
          this.pos += 1
          return "new-line"
        } else {
          return null
        }
      }
      case "string": {
        if (this.text[this.pos] === '"') {
          let escapes = 0
          while (this.text[this.pos - (1 + escapes)] === "\\") {
            escapes += 1
          }
          const quotesAreEscaped = escapes % 2 !== 0
          if (quotesAreEscaped) return null
          else {
            this.pos += 1
            this.col += 1
            return "string-delim"
          }
        } else {
          return null
        }
      }
      case "multi-line-string": {
        if (
          this.text[this.pos] === '"' &&
          this.text[this.pos + 1] === '"' &&
          this.text[this.pos + 2] === '"'
        ) {
          let escapes = 0
          while (this.text[this.pos - (1 + escapes)] === "\\") {
            escapes += 1
          }
          const quotesAreEscaped = escapes % 2 !== 0
          if (quotesAreEscaped) return null
          else {
            this.pos += 3
            this.col += 3
            return "multi-line-string-delim"
          }
        } else {
          return null
        }
      }
    }
  }

  atEndPos(): boolean {
    return this.line >= this.endPos.line && this.col >= this.endPos.character
  }

  parseToEndPos(): DocState {
    while (!this.atEndPos()) {
      const delim = this.consumeNextDelim()
      if (delim) {
        this.state = DocStateParser.nextState(this.state, delim)
      } else {
        if (this.text[this.pos] === "\n") {
          this.incLine()
          this.pos += 1
        } else {
          this.pos += 1
          this.col += 1
        }
      }
    }
    return this.state
  }
}

const typeOf = (client: IdrisClient) => (
  document: vscode.TextDocument,
  position: vscode.Position
): Promise<string | null> =>
  new Promise(async (res) => {
    const range = document.getWordRangeAtPosition(position)
    if (!range) res(null)

    const parser = new DocStateParser(document.getText(), position)
    const docStateAtPos = parser.parseToEndPos()
    if (docStateAtPos !== "code") res(null)

    const name = document.getText(range)
    const trimmed = name.startsWith("?") ? name.slice(1, name.length) : name
    const reply = await client.typeOf(trimmed)
    res(reply.ok ? reply.typeOf : null)
  })

const typeAt = (client: IdrisClient) => (
  document: vscode.TextDocument,
  position: vscode.Position
): Promise<string | null> =>
  new Promise(async (res) => {
    const range = document.getWordRangeAtPosition(position)
    if (!range) res(null)

    const parser = new DocStateParser(document.getText(), position)
    const docStateAtPos = parser.parseToEndPos()
    if (docStateAtPos !== "code") res(null)

    const name = document.getText(range)
    const trimmed = name.startsWith("?") ? name.slice(1, name.length) : name
    const reply = await client.typeAt(
      trimmed,
      position.line + 1,
      position.character + 1
    )
    res(reply.ok ? reply.typeAt : null)
  })

export class Provider implements vscode.HoverProvider {
  private typeOf: (
    document: vscode.TextDocument,
    position: vscode.Position
  ) => Promise<string | null>
  private typeAt: (
    document: vscode.TextDocument,
    position: vscode.Position
  ) => Promise<string | null>

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
