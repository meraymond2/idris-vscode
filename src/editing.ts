import * as vscode from "vscode"

interface Term {
  name: string
  line: number // lines are 0-indexed
  range: vscode.Range
}

const previousChar = (document: vscode.TextDocument, range: vscode.Range): string =>
  document.getText(
    new vscode.Range(
      new vscode.Position(range.start.line, range.start.character - 1),
      new vscode.Position(range.start.line, range.start.character)
    )
  )

/**
 * Get the term under the cursor.
 */
export const currentWord = (): Term | null => {
  const editor = vscode.window.activeTextEditor
  const document = editor?.document
  const position = editor?.selection.active
  if (!position || !document) return null

  const range = document?.getWordRangeAtPosition(position)
  if (!range) return null

  // If the selection is embedded within a Markdown file, the word boundaries
  // won’t include preceding ?s, which is a problem when selecting holes.
  if (document.languageId === "markdown" && previousChar(document, range) === "?") {
    const extendedRange = range.with(range.start.with(range.start.line, range.start.character - 1), range.end)
    const name = document.getText(extendedRange)
    return { name, line: position.line, range: extendedRange }
  }

  const name = document.getText(range)
  return { name, line: position.line, range }
}

/**
 * Get the first term currently highlighted.
 */
export const currentSelection = (): Term | null => {
  const editor = vscode.window.activeTextEditor
  const document = editor?.document
  const selection = editor?.selection
  if (document && selection?.start && selection?.end) {
    const range = new vscode.Range(selection?.start, selection?.end)
    const name = document.getText(range)
    return { name, line: selection.start.line, range }
  } else return null
}

/**
 * Get the line after the current declaration. Naïve, doesn’t have any
 * knowledge of the AST, just skips over anything that’s indented.
 */
export const lineAfterDecl = (declLine: number): number => {
  const defaultTo = declLine + 1
  const editor = vscode.window.activeTextEditor
  const document = editor?.document
  if (!document) return defaultTo
  let insertAtLine
  for (let nextLineNumber = declLine + 1; nextLineNumber < document.lineCount + 1; nextLineNumber++) {
    if (nextLineNumber === document.lineCount) {
      insertAtLine = nextLineNumber
      break
    }
    const nextLine = document.lineAt(nextLineNumber)
    const hasIndentedText = /^\s+\S+/.test(nextLine.text)
    if (!hasIndentedText) {
      insertAtLine = nextLineNumber
      break
    }
  }
  return insertAtLine || defaultTo
}

/**
 * Get the first empty line above the current line.
 */
export const prevEmptyLine = (fromLine: number, languageId: string): number => {
  const defaultTo = fromLine - 1
  const editor = vscode.window.activeTextEditor
  const document = editor?.document
  if (!document) return defaultTo
  let insertAtLine
  for (let line = fromLine - 1; line > 0; line--) {
    const prevLine = document.lineAt(line)
    const isEmptyLine = languageId === "lidr" ? /^>\s*$/.test(prevLine.text) : prevLine.isEmptyOrWhitespace
    if (isEmptyLine) {
      insertAtLine = line
      break
    }
  }
  return insertAtLine || defaultTo
}

/**
 * Get the indentation of a line.
 */
export const getIndent = (line: number): string => {
  const editor = vscode.window.activeTextEditor
  const document = editor?.document
  if (editor && document) {
    const l = document.lineAt(line)
    const end = l.firstNonWhitespaceCharacterIndex
    return l.text.slice(0, end)
  } else return ""
}

/**
 * Insert `text` at the specified line and number, along with a new line.
 */
export const insertLine = (text: string, line: number, column: number = 0): void => {
  const editor = vscode.window.activeTextEditor
  editor?.edit((eb) => {
    const pos = new vscode.Position(line, column)
    // If you try to insert past the end of the file, it will simply append it
    // to the final line, so in that case start with a newline.
    const prefix = line === editor.document.lineCount ? "\n" : ""
    const suffix = "\n"
    eb.insert(pos, prefix + text + suffix)
  })
}

/**
 * Replace the contents of the specified line with `text`.
 */
export const replaceLine = (text: string, line: number): void => {
  const editor = vscode.window.activeTextEditor
  const document = editor?.document
  if (editor && document) {
    editor.edit((eb) => {
      eb.replace(document.lineAt(line).range, text)
    })
  }
}

/**
 * Replace a range of text with the specified string.
 */
export const replaceRange = (text: string, range: vscode.Range): void => {
  const editor = vscode.window.activeTextEditor
  editor?.edit((eb) => {
    eb.replace(range, text)
  })
}
