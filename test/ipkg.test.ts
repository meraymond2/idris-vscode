import { assert } from "chai"
import { extractPkgs } from "../src/ipkg"

const ipkgFile = `
package myProject

pkgs = pruviloj, lightyear
`

describe("ipkg file parsing", () => {
  it("returns a list of pkg names", () => {
    const actual = extractPkgs(ipkgFile)
    const expected = ["pruviloj", "lightyear"]

    assert.deepEqual(actual, expected)
  })
})
