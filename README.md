# idris-vscode

Support for [Idris](https://www.idris-lang.org/), the dependently-typed, functional language.

- [Requirements](#requirements)
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
- [Status](#status)
- [To Do](#todo)
- [License](#license)

## Requirements

You’ll need Idris installed. If it’s not on your $PATH, you can specify the path to the executable in the config.

## Idris 2
Currently the extension will default to v1. If you want it to use Idris 2, you can simply change the Idris path in your config.

At the moment, the majority of the IDE commands haven’t been implemented in Idris 2. Most will simply return an empty reply. It should provide limited functionality though.

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

## Semantic Highlighting
The apropos, browse namespace, documentation and definition commands use VS’s semantic highlighting API to colourise their output. If you don’t see any highlighting, it’s likely that your theme doesn’t support it yet.

Currently, Idris source files _don’t_ use semantic highlighting. There are a few issues to work out to get it to sync with Idris in a non-terrible way.

## Status
Under active development. Should be mostly working, but there are still features to do.

If you run into any problems, please raise an issue, or raise a PR if you want to.

## To Do
- implement Show References
- there is more information to add to the metavariables command output
- semantic highlighting for source code
- more ipkg integration

## Acknowledgments
The syntax files are taken from [vscode-idris’s](https://github.com/zjhmale/vscode-idris) port of the [Atom plugin’s](https://github.com/idris-hackers/atom-language-idris) grammars.

## License
[MIT](LICENSE)
