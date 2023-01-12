const PYTHON = require("tree-sitter-python/grammar")

module.exports = grammar(PYTHON, {
    // For reference, see:
    // https://snakemake.readthedocs.io/en/stable/snakefiles/writing_snakefiles.html#grammar
    // However, the grammar described therein is incomplete.
    name: "snakemake",

    conflicts: ($, original) => original.concat([
        [$._rule_import_list, $.rule_inheritance],
        [$.wildcard_string, $.string],
        [$.concatenated_wildcard_string, $.concatenated_string],
    ]),

    externals: ($, original) => original.concat([
        $._wildcard_string_start
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

        _simple_directive: $ => choice(
            $.configfile_directive,
            $.container_directive,
            $.include_directive,
            $.localrules_directive,
            $.onerror_directive,
            $.onstart_directive,
            $.onsuccess_directive,
            $.version_directive,
            $.wildcard_constraints_directive,
            $.workdir_directive
        ),

        _compound_directive: $ => choice(
            $.rule_definition,
            $.rule_inheritance,
            $.module_definition
        ),

        rule_definition: $ => seq(
            "rule",
            optional(
                field('name', $.identifier)
            ),
            ":",
            field('body', $.rule_body)
        ),

        rule_import: $ => seq(
            "use",
            "rule",
            choice(
                $.wildcard_import,
                $._rule_import_list,
                seq("(", $._rule_import_list, ")")
            ),
            "from",
            field("module_name", $.identifier),
            optional(seq(
                "as",
                field(
                    "alias",
                    alias($._rule_import_as_pattern_target, $.as_pattern_target))
            ))
        ),

        _rule_import_list: $ => (seq(
            commaSep1(field("name", $.identifier)),
            optional(",")
        )),

        _rule_import_as_pattern_target: $ => /[_*\p{XID_Start}][_*\p{XID_Continue}]*/,

        rule_inheritance: $ => seq(
            "use",
            "rule",
            field("name", $.identifier),
            optional(seq(
                "from",
                field("module_name", $.identifier)
            )),
            "as",
            field("alias", alias($.identifier, $.as_pattern_target)),
            "with",
            ":",
            field("body", $.rule_body)
        ),

        rule_body: $ => seq(
            $._indent,
            repeat(
                choice(
                    prec(-1, $.string),
                    prec(1, $.concatenated_string), // docstrings
                    $._rule_directive
                )
            ),
            $._dedent
        ),

        _rule_directive: $ => choice(
            $.input_directive,
            $.output_directive,
            $.params_directive,
            $.log_directive,
            $.benchmark_directive,
            $.cache_directive,
            $.message_directive,
            $.threads_directive,
            $.resources_directive,
            $.conda_directive,
            $.container_directive,
            $.singularity_directive,
            $.run_directive,
            $.shell_directive,
            $.script_directive,
            $.notebook_directive,
            $.shadow_directive,
            $.priority_directive,
            $.retries_directive,
            $.cwl_directive,
            $.handover_directive,
            $.wrapper_directive,
            $.wildcard_constraints_directive
        ),

        module_definition: $ => seq(
            "module",
            $.identifier,
            ":",
            field("body", $.module_body)
        ),

        module_body: $ => seq(
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

        _module_directive: $ => choice(
            $.config_directive,
            $.meta_wrapper_directive,
            $.prefix_directive,
            $.skip_validation_directive,
            $.snakefile_directive
        ),

        // DIRECTIVES

        // Directives with parameters

        benchmark_directive: $ => seq(
            "benchmark",
            ":",
            field("arguments", $.directive_parameters)
        ),

        cache_directive: $ => seq(
            "cache",
            ":",
            field("arguments", $.directive_parameters)
        ),

        conda_directive: $ => seq(
            "conda",
            ":",
            field("arguments", $.directive_parameters)
        ),

        config_directive: $ => seq(
            "config",
            ":",
            field("arguments", $.directive_parameters)
        ),

        configfile_directive: $ => seq(
            "configfile",
            ":",
            field("arguments", $.directive_parameters)
        ),

        container_directive: $ => seq(
            "container",
            ":",
            field("arguments", $.directive_parameters)
        ),

        cwl_directive: $ => seq(
            "cwl",
            ":",
            field("arguments", $.directive_parameters)
        ),

        handover_directive: $ => seq(
            "handover",
            ":",
            field("arguments", $.directive_parameters)
        ),

        include_directive: $ => seq(
            "include",
            ":",
            field("arguments", $.directive_parameters)
        ),

        input_directive: $ => seq(
            "input",
            ":",
            field("arguments", $.directive_parameters)
        ),

        localrules_directive: $ => seq(
            "localrules",
            ":",
            field("arguments", $.directive_parameters)
        ),

        log_directive: $ => seq(
            "log",
            ":",
            field("arguments", $.directive_parameters)
        ),

        message_directive: $ => seq(
            "message",
            ":",
            field("arguments", $.directive_parameters)
        ),

        meta_wrapper_directive: $ => seq(
            "meta_wrapper",
            ":",
            field("arguments", $.directive_parameters)
        ),

        notebook_directive: $ => seq(
            "notebook",
            ":",
            field("arguments", $.directive_parameters)
        ),

        output_directive: $ => seq(
            "output",
            ":",
            field("arguments", $.directive_parameters)
        ),

        params_directive: $ => seq(
            "params",
            ":",
            field("arguments", $.directive_parameters)
        ),

        prefix_directive: $ => seq(
            "prefix",
            ":",
            field("arguments", $.directive_parameters)
        ),

        priority_directive: $ => seq(
            "priority",
            ":",
            field("arguments", $.directive_parameters)
        ),

        resources_directive: $ => seq(
            "resources",
            ":",
            field("arguments", $.directive_parameters)
        ),

        retries_directive: $ => seq(
            "retries",
            ":",
            field("arguments", $.directive_parameters)
        ),

        script_directive: $ => seq(
            "script",
            ":",
            field("arguments", $.directive_parameters)
        ),

        shadow_directive: $ => seq(
            "shadow",
            ":",
            field("arguments", $.directive_parameters)
        ),

        shell_directive: $ => seq(
            "shell",
            ":",
            field("arguments", $.directive_parameters)
        ),

        singularity_directive: $ => seq(
            "singularity",
            ":",
            field("arguments", $.directive_parameters)
        ),

        skip_validation_directive: $ => seq(
            "skip_validation",
            ":",
            field("arguments", $.directive_parameters)
        ),

        snakefile_directive: $ => seq(
            "snakefile",
            ":",
            field("arguments", $.directive_parameters)
        ),

        threads_directive: $ => seq(
            "threads",
            ":",
            field("arguments", $.directive_parameters)
        ),

        version_directive: $ => seq(
            "version",
            ":",
            field("arguments", $.directive_parameters)
        ),

        wildcard_constraints_directive: $ => seq(
            "wildcard_constraints",
            ":",
            field("arguments", $.directive_parameters)
        ),

        workdir_directive: $ => seq(
            "workdir",
            ":",
            field("arguments", $.directive_parameters)
        ),

        wrapper_directive: $ => seq(
            "wrapper",
            ":",
            field("arguments", $.directive_parameters)
        ),

        // Directives with code blocks

        onerror_directive: $ => seq(
            "onerror",
            ":",
            field("body", $._suite)
        ),

        onstart_directive: $ => seq(
            "onstart",
            ":",
            field("body", $._suite)
        ),

        onsuccess_directive: $ => seq(
            "onsuccess",
            ":",
            field("body", $._suite)
        ),

        run_directive: $ => seq(
            "run",
            ":",
            field("body", $._suite)
        ),

        // STRINGS
        // string: ($, original) => prec.dynamic(1, original),
        concatenated_string: ($, original) => prec.right(original),

        concatenated_wildcard_string: $ => prec.right(1, seq(
            choice($.string, $.wildcard_string),
            repeat1(choice($.string, $.wildcard_string))
        )),

        wildcard_string: $ => choice(
            $._wildcard_definition,
            $.concatenated_wildcard_string
        ),

        _wildcard_definition: $ => seq(
            alias($._wildcard_string_start, "\""),
            repeat(choice(
                $._string_content,
                $.escape_sequence,
                $._not_escape_sequence,
                seq("{", $.wildcard_definition, "}"),
                "{}" // empty brackets are not a wildcard
            )),
            alias($._string_end, "\"")
        ),

        wildcard_definition: $ => seq(
            field("name", $.identifier),
            optional(field("constraints", seq(",", $.constraints))),
        ),

        // regex to match a regex ...
        // explicitly specify bracketed quantifier to consume paired
        // brackets before the external scanner gets a chance to see them.
        constraints: $ => /([^}]|(\{\d+\}))+/,

        directive_parameters: $ => choice(
            // Single line
            seq(
                commaSep1($._directive_parameter),
                optional(","),
                $._newline
            ),
            // Indented block
            $._indented_directive_parameters,
            // On opening line + subsequently indented
            seq(
                commaSep1($._directive_parameter),
                ",",
                $._indented_directive_parameters
            )
        ),

        _indented_directive_parameters: $ => seq(
            $._indent,
            commaSep1($._directive_parameter),
            $._dedent
        ),

        _directive_parameter: $ => choice(
            $.expression,
            alias($.wildcard_string, $.string),
            $.keyword_argument,
            $.list_splat,
            $.dictionary_splat
        )
    }
});

function commaSep1(rule) {
  return sep1(rule, ',')
}

function sep1(rule, separator) {
  return seq(rule, repeat(seq(separator, rule)))
}
