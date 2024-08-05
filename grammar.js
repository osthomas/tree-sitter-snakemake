const PYTHON = require("tree-sitter-python/grammar")
module.exports = grammar(PYTHON, {
    // For reference, see:
    // https://snakemake.readthedocs.io/en/stable/snakefiles/writing_snakefiles.html#grammar
    // However, the grammar described therein is incomplete.
    name: "snakemake",

    externals: ($, original) => original.concat([
        // Define flags to distinguish regular strings from wildcard strings
        $._ALLOW_WC_DEF,
        $._ALLOW_WC_INTERP,
        $._DISALLOW_WC,
        $._WILDCARD_DEF_OPEN,
        $._WILDCARD_INTERP_OPEN
    ]),

    inline: ($, original) => original.concat([
        $._simple_directive,
        $._rule_directive,
        $._module_directive,
    ]),

    rules: {
        _compound_statement: ($, original) => choice(
            original,
            $._compound_directive
        ),

        _statement: ($, original) => choice(
            original,
            $._simple_directive,
            $.rule_import
        ),

        _simple_directive: $ => alias(choice(
            $._simple_directive_wc_none,
            $._simple_directive_block,
            $.localrules_directive,
            $.ruleorder_directive
        ), $.directive),

        _simple_directive_wc_none: $ => new_directive(
            choice(
                "configfile",
                "container",
                "envvars",
                "include",
                "pepfile",
                "pepschema",
                "scattergather",
                "version",
                "wildcard_constraints",
                "workdir"
            ),
            "arguments",
            $._directive_parameters_wc_none
        ),

        _simple_directive_block: $ => new_directive(
            choice(
                "onerror",
                "onstart",
                "onsuccess"
            ),
            "body",
            $._suite
        ),

        localrules_directive: $ => new_directive("localrules", "arguments",
            $._directive_parameters_identifiers),
        ruleorder_directive: $ => new_directive("ruleorder", "arguments",
            $._directive_parameters_ruleorder),

        _compound_directive: $ => choice(
            $.rule_definition,
            $.checkpoint_definition,
            $.rule_inheritance,
            $.module_definition
        ),

        rule_definition: $ => seq(
            "rule",
            optional(
                field('name', $.identifier)
            ),
            ":",
            field('body', $._rule_suite)
        ),

        checkpoint_definition: $ => seq(
            "checkpoint",
            optional(
                field('name', $.identifier)
            ),
            ":",
            field('body', $._rule_suite)
        ),

        rule_import: $ => prec.right(seq(
            "use",
            "rule",
            choice(
                $.wildcard_import,
                $.rule_import_list
            ),
            "from",
            field("module_name", $.identifier),
            optional(seq(
                "exclude",
                $.rule_exclude_list
            )),
            optional(seq(
                "as",
                field(
                    "alias",
                    alias($._rule_import_as_pattern_target, $.as_pattern_target))
            )),
            optional(seq(
                "with",
                ":",
                field("body", $._rule_suite)
            ))
        )),

        rule_import_list: $ => choice(
          commaSep1($.identifier),
          seq("(", commaSep1($.identifier), ")")
        ),

        // as of snakemake 8.4.8, a parenthesized rule exclude list is
        // invalid (as opposed to a parenthesized rule import list)
        rule_exclude_list: $ => commaSep1($.identifier),

        _rule_import_as_pattern_target: $ => /[_*\p{XID_Start}][_*\p{XID_Continue}]*/,

        rule_inheritance: $ => seq(
            "use",
            "rule",
            field("name", $.identifier),
            "as",
            field("alias", alias($.identifier, $.as_pattern_target)),
            "with",
            ":",
            field("body", $._rule_suite)
        ),

        // analogous to tree-sitter-python: _suite
        _rule_suite: $ => choice(
          seq($._indent, $.rule_body),
          $._newline,
        ),

        // analogous to tree-sitter-python: block
        rule_body: $ => seq(
          repeat(
            choice(
              prec(-1, $.string),
              prec(1, $.concatenated_string), // docstrings
              $._rule_directive
            )
          ),
          $._dedent
        ),

        // Directives which can appear in rule definitions
        _rule_directive: $ => alias(choice(
            $._rule_directive_wc_def,
            $._rule_directive_wc_interp,
            $._rule_directive_wc_none,
            $._rule_directive_block
        ), $.directive),

        // Rule directives with wildcard definitions
        _rule_directive_wc_def: $ => new_directive(
            choice(
                "benchmark",
                "input",
                "log",
                "output"
            ),
            "arguments",
            $._directive_parameters_wc_def
        ),

        // Rule directives with wildcard interpolations
        _rule_directive_wc_interp: $ => new_directive(
            choice(
                "message",
                "notebook",
                "script",
                "shell"
            ),
            "arguments",
            $._directive_parameters_wc_interp
        ),

        // Rule directives without wildcards
        _rule_directive_wc_none: $ => new_directive(
            choice(
                "cache",
                "conda",
                "container",
                "cwl",
                "default_target",
                "envmodules",
                "group",
                "handover",
                "localrule",
                "params",
                "priority",
                "resources",
                "retries",
                "shadow",
                "singularity",
                "template_engine",
                "threads",
                "wildcard_constraints",
                "wrapper"
            ),
            "arguments",
            $._directive_parameters_wc_none
        ),

        // Rule directives with code blocks
        _rule_directive_block: $ => new_directive(
            "run",
            "body",
            $._suite
        ),

        module_definition: $ => seq(
            "module",
            field("name", $.identifier),
            ":",
            field("body", $.module_body)
        ),

        module_body: $ => choice(
            seq(
                $._indent,
                repeat1(
                    choice(
                        prec(-1, $.string),
                        prec(1, $.concatenated_string), // docstrings
                        $._module_directive
                    )
                ),
                $._dedent
            ),
            $._newline
        ),

        _module_directive: $ => alias(choice(
            $._module_directive_wc_none,
        ), $.directive),

        // Module directives without wildcards
        _module_directive_wc_none: $ => new_directive(
            choice(
                "config",
                "meta_wrapper",
                "prefix",
                "skip_validation",
                "snakefile"
            ),
            "arguments",
            $._directive_parameters_wc_none
        ),


        // DIRECTIVE PARAMETERS

        // Parameters for directives which do not support wildcards
        __directive_parameters_wc_none: $ => directive_parameters( $, $._directive_parameter),
        _directive_parameters_wc_none: $ => alias(
            $.__directive_parameters_wc_none,
            $.directive_parameters
        ),

        // Parameters for directives which allow *definition* of wildcards
        __directive_parameters_wc_def: $ => seq(
            $._ALLOW_WC_DEF,
            directive_parameters($, $._directive_parameter),
            $._DISALLOW_WC
        ),
        _directive_parameters_wc_def: $ => alias(
            $.__directive_parameters_wc_def,
            $.directive_parameters
        ),

        // Parameters for directives which allow *interpolation* of wildcards
        __directive_parameters_wc_interp: $ => seq(
            $._ALLOW_WC_INTERP,
            directive_parameters($, $._directive_parameter),
            $._DISALLOW_WC
        ),
        _directive_parameters_wc_interp: $ => alias(
            $.__directive_parameters_wc_interp,
            $.directive_parameters
        ),

        // Identifier list (for localrules)
        __directive_parameters_identifiers: $ => directive_parameters($, $.identifier),
        _directive_parameters_identifiers: $ => alias(
            $.__directive_parameters_identifiers,
            $.directive_parameters
        ),

        // Identifier comparisons (for ruleorder)
        __directive_parameters_ruleorder: $ => seq(
            $.identifier,
            optional(repeat1(seq(">", $.identifier)))
        ),
        _directive_parameters_ruleorder: $ => alias(
            $.__directive_parameters_ruleorder,
            $.directive_parameters
        ),

        _directive_parameter: $ => choice(
            $.expression,
            $.keyword_argument,
            $.list_splat,
            $.dictionary_splat
        ),

        // STRINGS
        string: $ => seq(
            $.string_start,
            repeat(choice($.interpolation, $.wildcard, $.string_content)),
            $.string_end
        ),

        // The WILDCARD_DEF_OPEN and WILDCARD_INTERP_OPEN tokens are emitted by
        // the external scanner upon encountering an opening bracket for
        // definition/interpolation wildcard string, respectively, depending on
        // whether wildcards are allowed in the current context
        // (ALLOW_WC/DISALLOW_WC) to disambiguate wildcards from f string
        // interpolations.
        _wildcard_definition: $ => seq(
            $._WILDCARD_DEF_OPEN,
            "{",
            $.identifier,
            optional(seq(
                ",",
                $.constraint
            )),
            "}"
        ),


        // Flags to treat wildcard interpolations specially
        flag: $ => choice(
            "q"  // quote elements that contain whitespace
        ),


        _wildcard_interpolation: $ => seq(
            $._WILDCARD_INTERP_OPEN,
            "{",
            choice(
                $.identifier,
                $.attribute,
                $.subscript
            ),
            optional(seq(
                ":",
                $.flag
            )),
            "}"
        ),

        wildcard: $ => choice(
            $._wildcard_definition,
            $._wildcard_interpolation
        ),

        constraint: $ => /([^{}]|(\{\d+\}))+/,

        concatenated_string: ($, original) => prec.right(original)
    }
});

function commaSep1(rule, sep_trail = true) {
  return prec.right(sep1(rule, ',', sep_trail = sep_trail))
}

function sep1(rule, separator, sep_trail = true) {
  if (sep_trail) {
    return seq(rule, repeat(seq(separator, rule)), optional(separator))
  } else {
    return seq(rule, repeat(seq(separator, rule)))
  }
}

function new_directive(name, body_name, parameters) {
    return seq(
        field("name", name),
        ":",
        field(body_name, parameters)
    )
}

function directive_parameters($, rule) {
    return(choice(
        // Single line
        seq(commaSep1(rule), $._newline),
        // Indented block
        seq(
            // Can start on opening line (unindented)
            optional(seq(commaSep1(rule, sep_trail = false), ",")),
            seq(
                $._indent,
                optional(commaSep1(rule)),
                $._dedent
            ),
        ),
        // empty: this is syntactically invalid, but improves live highlighting
        $._newline
    ))
}
