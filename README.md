# idris-vscode

Support for [Idris](https://www.idris-lang.org/), the dependently-typed, functional language.

- [Installation](#installation)
- [Idris 2](#idris-2)
- [Commands](#commands)
  - [Code Navigation](#code-navigation)
  - [Code Editing](#code-editing)
  - [Diagnostics](#diagnostics)
  - [Testing](#testing)
  - [Debugging](#debugging)
  - [Others](#others)
  - [Add Clause](#add-clause)
  - [Add Missing](#add-missing)
  - [Apropos](#apropos)
  - [Apropos At Cursor](#apropos-at-cursor)
  - [Browse Namespace](#browse-namespace)
  - [Case Split](#case-split)
  - [Documentation For](#documentation-for)
  - [Documentation At Cursor](#documentation-at-cursor)
  - [Generate Definition](#generate-definition)
  - [Interpret Selection](#interpret-selection)
  - [List Metavariables](#list-metavariables)
  - [Print Definition](#print-definition)
  - [Print Definition At Cursor](#print-definition-at-cursor)
  - [Make Case](#make-case)
  - [Make Lemma](#make-lemma)
  - [Make With](#make-with)
  - [Proof Search](#proof-search)
  - [Version](#version)
- [Keybindings](#keybindings)
- [Semantic Highlighting](#semantic-highlighting)
- [To Do](#todo)
- [About](#about)
- [License](#license)

## Installation

The plugin itself can be installed from within VSCode or VSCodium through the Extensions Panel. It should come up if you search for ‘Idris’. The extension id is `meraymond.idris-vscode`.

You can also download the vsix file from the [Releases page](https://github.com/meraymond2/idris-vscode/releases) on Github, or from the [VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=meraymond.idris-vscode), or from the [Open VSX Registry](https://open-vsx.org/extension/meraymond/idris-vscode).

You will need Idris or Idris 2 installed separately. If it’s not on your $PATH, you can specify the absolute path to the executable in the config. The extension will not download or install anything on the user’s behalf.

If you want to test local changes to the extension, build it with `npm install && npm run watch`, then you can launch the local version with Run > Start Debugging inside VS.

## Idris 2
Currently the extension will default to v1. If you want it to use Idris 2, change the path in the configuration to your Idris 2 binary, and tick the `Idris 2 Mode` checkbox.

Only the current version of Idris 2 is supported, which at the moment is 0.4.0. If you experience problems, please make sure you are using the most recent version.

At the moment, some of the IDE commands haven’t been implemented in Idris 2. There are no completions yet either.

## Commands

#### Add Clause
Generate the initial clause for the function definition under the cursor.

#### Add Missing
Generate pattern matches for any missing clauses for the function definition or case statement under the cursor.

#### Apropos
Search the documentation for references to a string.

#### Apropos At Cursor
Search the documentation for references to the word under the cursor.

#### Browse Namespace
Show all declarations and sub-modules for a given namespace.

#### Case Split
Split the variable under the cursor into all possible pattern matches.

#### Documentation For
Show the documentation for a given function.

#### Documentation At Cursor
Show the documentation for the function under the cursor.

#### Generate Definition
Generate complete definition for the function definition under the cursor.

#### Interpret Selection
Interpret the highlighted code and show the result in the editor.

#### List Metavariables
Show a list of all the holes (metavariables) in the current namespace.

#### Print Definition
Show the definition for a given function.

#### Print Definition At Cursor
Show the definition for the function under the cursor.

#### Make Case
Turn the variable under the cursor into a case statement.

#### Make Lemma
Create a new function declaration, and use it to solve the hole under the cursor.

#### Make With
Turn the variable under the cursor into a with statement.

#### Proof Search
Solve the hole under the cursor.

#### Version
Show the current version of Idris.

## Keybindings
The extension doesn’t set any key-bindings out of the box, but here are some suggested bindings based on the Atom plugin. Just copy them to your User/keybindings.json.
```
[
  {
    "key": "ctrl+alt+a",
    "command": "idris.addClause",
    "when": "editorLangId == idris && editorTextFocus"
  },
  {
    "key": "ctrl+alt+b",
    "command": "idris.browseNamespace",
    "when": "editorLangId == idris && editorTextFocus"
  },
  {
    "key": "ctrl+alt+c",
    "command": "idris.caseSplit",
    "when": "editorLangId == idris && editorTextFocus"
  },
  {
    "key": "ctrl+alt+d",
    "command": "idris.docsForSelection",
    "when": "editorLangId == idris && editorTextFocus"
  },
  {
    "key": "ctrl+alt+g",
    "command": "idris.generateDef",
    "when": "editorLangId == idris && editorTextFocus"
  },
  {
    "key": "ctrl+alt+i",
    "command": "idris.interpretSelection",
    "when": "editorLangId == idris && editorTextFocus"
  },
  {
    "key": "ctrl+alt+m",
    "command": "idris.makeCase",
    "when": "editorLangId == idris && editorTextFocus"
  },
  {
    "key": "ctrl+alt+l",
    "command": "idris.makeLemma",
    "when": "editorLangId == idris && editorTextFocus"
  },
  {
    "key": "ctrl+alt+w",
    "command": "idris.makeWith",
    "when": "editorLangId == idris && editorTextFocus"
  },
  {
    "key": "ctrl+alt+p",
    "command": "idris.proofSearch",
    "when": "editorLangId == idris && editorTextFocus"
  }
]
```

## Literate Idris
The extension should work equally well for literate Idris files. For [Idris 1](https://docs.idris-lang.org/en/latest/tutorial/miscellany.html#literate-programming), this only applies to .lidr files. [Idris 2](https://idris2.readthedocs.io/en/latest/reference/literate.html) extends this this to embedded code blocks in Markdown, LaTeX and Org-Mode files. However, the extension will only activate automatically for `.idr` and `.lidr` files. In order to use it for other file types, it may need be activated manually, with the `Idris: Activate Extension` command, if you have not previously opened any Idris files.

LaTeX and Org-Mode are not yet implemented, but Markdown support is.

## Semantic Highlighting
The apropos, browse namespace, documentation and definition commands use VS’s semantic highlighting API to colourise their output. If you don’t see any highlighting, it’s likely that your theme doesn’t support it yet.

Currently, Idris source files _don’t_ use semantic highlighting. There are a few issues to work out to get it to sync with Idris in a non-terrible way. Also Idris 2 does not yet return the metadata required for semantic highlighting.

## To Do
- implement Show References
- there is more information to add to the metavariables command output
- semantic highlighting for source code
- more ipkg integration

## About
The extension should be mostly stable for Idris 1, though there a few remaining unimplemented actions. Current work is focused on fixing bugs and maintaining support for Idris 2.

If you run into any problems, please raise an issue, or raise a PR if you want to.

There is not, nor will there ever be, telemetry in this extension (though that may not apply to VS itself).

## Acknowledgments
The syntax files are adapted from [vscode-idris’s](https://github.com/zjhmale/vscode-idris) port of the [Atom plugin’s](https://github.com/idris-hackers/atom-language-idris) grammars.

## License
[MIT](LICENSE)
