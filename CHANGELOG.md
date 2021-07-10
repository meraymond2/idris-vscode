## Unreleased
### Added
- Hover support for .lidr files.
### Changed
### Fixed
- Fixed a bug where hover would send erroneous typecheck requests that weren't displayed, but slowed down the process.

## 0.0.9
### Added
### Changed
- Don't try to execute v2 commands if not in v2 mode, show warning instead.
- Stop passing console width flag to Idris 2 proc, as no longer needed.
### Fixed
- Fix bug where VS couldn't insert past end of document.
- Change the function_signature highlighting rule to add fewer scopes, fixing the highlighting of case statements within the signature.

## 0.0.8
### Added
- Added :generate-def command.
- Added :type-at as an option for hover behaviour.
### Changed
- Shorten Idris 2 error message to remove superfluous location information.
### Fixed
- Fix syntax highlighting of nested block comments.

## 0.0.7
### Added
### Changed
- Trim leading `?` so hover can show types of metavariables.
- Bump idris-ide-client version to 0.1.4, which has better Idris 2 support.
### Fixed
- Fix a bug where extension would prompt for reload on _any_ config change.
- Workaround a bug in Idris 2 where it would mangle messages based on a mis-inferred terminal width.

## 0.0.6
### Added
### Changed
- Added a warning when load file fails in Idris2 because of errors.

### Fixed
- Fixed a bug that could lead to incorrect paths in the diagnostic URIs.

# 0.0.5
### Added
- Added a config flag to enable Idris 2 mode.
- Added a config option to turn off the hover behaviour.
- Added a warning for trying to call Version from Idris 2.

### Changed
- Bump dev dependencies to appease our dependabot overlords

### Fixed
- Fix hover text in inappropriate contexts (https://github.com/meraymond2/idris-vscode/issues/1)
- Fixed a bug in the text-mate highlighting where it didn’t handle all of the possible bracket types after backticks.
- Fixed a bug where the diagnostics didn't work with Idris 2.
- Fixed a bug where Idris 2 wouldn't find the ipkg file, and complain about module names (https://github.com/meraymond2/idris-vscode/issues/12).

# 0.0.4
### Added
- Support for .ipkg and .lidr syntax highlighting

### Changed
- Improved the regex syntax highlighting
- Updated dev dependencies for security

### Fixed
- Fixed an invisible bug where it would try to get the type of the whole document when hovering over a space
