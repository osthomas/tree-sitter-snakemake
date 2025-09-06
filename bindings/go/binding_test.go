package tree_sitter_snakemake_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_snakemake "github.com/tree-sitter/tree-sitter-snakemake/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_snakemake.Language())
	if language == nil {
		t.Errorf("Error loading Snakemake grammar")
	}
}
