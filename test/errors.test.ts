import { assert } from "chai"
import { rmLocDesc } from "../src/providers/diagnostic-utils"

describe("Removing file locations from warnings", () => {
  it("handles missing case warnings", () => {
    const missingCase = `getName is not covering.\n\n/home/michael/dev/idris-ide-client/test/resources/test-v2.idr:9:1--9:31\n   |\n 9 | getName : (cat: Cat) -> String\n   | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^\n\nMissing cases:\n    getName Sherlock\n`

    const actual = rmLocDesc(missingCase)
    const expected =
      "getName is not covering.\n\nMissing cases:\n    getName Sherlock"

    assert.equal(actual, expected)
  })

  it("handles missing implementation errors", () => {
    const implNotFound = `While processing right hand side of getName. Can't find an implementation for Num String.\n\n/home/michael/dev/idris-ide-client/test/resources/test-v2.idr:12:20--12:21\n    |\n 12 | getName Sherlock = 8\n    |                    ^\n`
    const actual = rmLocDesc(implNotFound)
    const expected = `While processing right hand side of getName. Can't find an implementation for Num String.`

    assert.equal(actual, expected)
  })

  it("handles type mismatch errors", () => {
    const typeMismatch = `While processing right hand side of getName. When unifying Cat and String.\nMismatch between: Cat and String.\n\n/home/michael/dev/idris-ide-client/test/resources/test-v2.idr:12:20--12:23\n    |\n 12 | getName Sherlock = Cas\n    |                    ^^^\n`
    const actual = rmLocDesc(typeMismatch)
    const expected = `While processing right hand side of getName. When unifying Cat and String.\nMismatch between: Cat and String.`

    assert.equal(actual, expected)
  })

  it("handles parse errors", () => {
    const parseError = `Parse error at line 20:1:\nCouldn't parse declaration (next tokens: [identifier num, symbol :, identifier Nat, symbol <-, identifier Ok, identifier num, symbol =, hole identifier n_rhs, identifier append, symbol :])`
    const actual = rmLocDesc(parseError)
    const expected = `Couldn't parse declaration (next tokens: [identifier num, symbol :, identifier Nat, symbol <-, identifier Ok, identifier num, symbol =, hole identifier n_rhs, identifier append, symbol :])`

    assert.equal(actual, expected)
  })

  it("handles undefined name errors", () => {
    const undefinedName = `While processing left hand side of getName. Undefined name Luuuuna. \n\n/home/michael/dev/idris-ide-client/test/resources/test-v2.idr:11:9--11:16\n    |\n 11 | getName Luuuuna = \"Luna\"\n    |         ^^^^^^^\n`
    const actual = rmLocDesc(undefinedName)
    const expected = `While processing left hand side of getName. Undefined name Luuuuna.`

    assert.equal(actual, expected)
  })
})
