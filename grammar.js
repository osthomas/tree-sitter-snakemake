const PYTHON = require("tree-sitter-python/grammar")

module.exports = grammar(PYTHON, {
    name: "snakemake",

    rules: {
        _test: $ => "abc"
    }
});
