const PYTHON = require("../tree-sitter-python/grammar.js").rules;

module.exports = grammar({
    name: "snakemake_wildcards",

    externals: $ => [
        $._STRING_CONTENT
    ],
    word: $ => $.identifier,

    conflicts: $ => [
        [$._wildcard_definition, $.primary_expression]
    ],

    rules: {
        string: $ => repeat($._string_content),

        _string_content: $ => choice(
            $._STRING_CONTENT,
            $.wildcard,
            "{}" // empty brackets are not a wildcard
        ),

        // Inherit from Python
        identifier: $ => PYTHON.identifier,
        attribute: $ => PYTHON.attribute,
        slice: $ => PYTHON.slice,
        subscript: $ => PYTHON.subscript,
        integer: $ => seq(optional("-"), PYTHON.integer),

        // Restrict expressions to tokens allowed in wildcards
        expression: $ => choice(
            $.primary_expression
        ),

        primary_expression: $ => prec(1, choice(
            $.attribute,
            $.identifier,
            $.integer,
            $.subscript,
        )),

        _wildcard_definition: $ => seq(
            "{",
            field("name", $.identifier),
            optional(seq(
                ",",
                field("constraint",$.constraint))
            ),
            "}"
        ),

        _wildcard_interpolation: $ => seq(
            "{",
            field("name", $.primary_expression),
            "}"
        ),

        wildcard: $ => choice(
            $._wildcard_definition,
            $._wildcard_interpolation
        ),

        constraint: $ => seq(
            /([^}]|(\{\d+\}))+/
        ),
    }
});
