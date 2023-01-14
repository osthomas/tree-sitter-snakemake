const PYTHON = require("../tree-sitter-python/grammar.js").rules;

module.exports = grammar({
    name: "snakemake_wildcards",

    rules: {
        string: $ => repeat($._elements),

        _elements: $ => choice($.wildcard, $.string_content),

        string_content: $ => choice(
            /[^{}]+/,
        ),

        identifier: $ => PYTHON.identifier,
        attribute: $ => PYTHON.attribute,
        slice: $ => PYTHON.slice,
        subscript: $ => PYTHON.subscript,
        integer: $ => seq(optional("-"), PYTHON.integer),

        expression: $ => choice(
            $.primary_expression
        ),

        primary_expression: $ => choice(
            $.attribute,
            $.identifier,
            $.integer,
            $.subscript,
        ),

        wildcard: $ => seq(
            "{",
            $.expression,
            "}"
        )
    }
});
