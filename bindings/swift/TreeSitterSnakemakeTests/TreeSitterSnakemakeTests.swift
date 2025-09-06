import XCTest
import SwiftTreeSitter
import TreeSitterSnakemake

final class TreeSitterSnakemakeTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_snakemake())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Snakemake grammar")
    }
}
