## Unreleased
### Added
### Changed
- Trim leading `?` so hover can show types of metavariables.
- Bump client version to 0.1.4, which has better Idris 2 support.
### Fixed
- Fix a bug where extension would prompt for reload on _any_ config change.

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
