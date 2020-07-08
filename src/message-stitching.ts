import { VirtualDocInfo } from "./providers/virtual-docs"
import { MessageMetadata, Metavariable } from "idris-ide-client"

interface Decl {
  name: string
  metadata: MessageMetadata[]
}

/**
 * The browse namespace reply has a list of child namespaces, as well as a list
 * of declarations, each with their own metadata. In order to put these into a
 * single document, with correctly relative tokens, I’m going to stitch all of
 * the text into a single document (string), with adjusted metadata positions.
 *
 * It does require iterating over all of the metadata twice, but it means I
 * can reuse `metadataToTokens` on the result, instead of writing new functions.
 */
export const stitchBrowseNamespace = (
  subModules: string[],
  decls: Decl[]
): VirtualDocInfo => {
  // Sub-modules don’t come with metadata, but I want them highlighted as namespaces.
  const initial: {
    offset: number
    docText: string
    metadata: MessageMetadata[]
  } = { offset: 0, docText: "", metadata: [] }

  const first = subModules.reduce((acc, name) => {
    const spacer = "\n\n"
    const docText = acc.docText + name + spacer
    const offset = acc.offset + name.length + spacer.length
    const newMetadata: MessageMetadata = {
      start: acc.offset,
      length: name.length,
      metadata: { decor: ":module" },
    }
    return {
      docText,
      offset,
      metadata: acc.metadata.concat(newMetadata),
    }
  }, initial)

  const second = decls.reduce((acc, { name, metadata }) => {
    const spacer = "\n\n"
    const docText = acc.docText + name + spacer
    const offset = acc.offset + name.length + spacer.length
    const updatedMetadata = metadata.map((m) => ({
      ...m,
      start: m.start + acc.offset,
    }))
    return {
      docText,
      offset,
      metadata: acc.metadata.concat(updatedMetadata),
    }
  }, first)

  return {
    text: second.docText,
    metadata: second.metadata,
  }
}

/**
 * The metavariables reply has a list of metavars, each with a list of other
 * vars that are in its scope. The metavar and each of the other vars have their
 * own metadata. In order to put these into a single document, with correctly
 * relative tokens, We stitch all of the text into a single document
 * (string), with adjusted metadata positions.
 *
 * TODO: add the scope vars to the output.
 */
export const stitchMetavariables = (
  metavars: Metavariable[]
): VirtualDocInfo => {
  const initial: {
    offset: number
    docText: string
    metadata: MessageMetadata[]
  } = { offset: 0, docText: "", metadata: [] }
  const spacer = "\n\n"

  const doc = metavars.reduce((acc, { metavariable, premises }) => {
    const _todo = premises
    const nameText = metavariable.name + "\n"
    const typeText = metavariable.type + spacer
    const docText = acc.docText + nameText + typeText
    const offset = acc.offset + nameText.length + typeText.length
    const updatedMetadata = metavariable.metadata.map((m) => ({
      ...m,
      start: m.start + acc.offset + nameText.length,
    }))

    return {
      docText,
      offset: offset,
      metadata: acc.metadata.concat(updatedMetadata),
    }
  }, initial)

  return {
    text: doc.docText,
    metadata: doc.metadata,
  }
}
