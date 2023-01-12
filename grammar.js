const PYTHON = require("tree-sitter-python/grammar")

module.exports = grammar(PYTHON, {
    // For reference, see:
    // https://snakemake.readthedocs.io/en/stable/snakefiles/writing_snakefiles.html#grammar
    // However, the grammar described therein is incomplete.
    name: "snakemake",

    conflicts: ($, original) => original.concat([
        [$._rule_import_list, $.rule_inheritance],
        [$.string_wc_def, $.string],
        [$.string_wc_interp, $.string],
        [$.concatenated_string_wc_def, $.concatenated_string],
        [$.concatenated_string_wc_interp, $.concatenated_string],
    ]),

    externals: ($, original) => original.concat([
        $._wildcard_string_start,
        $._wildcard_interp_string_start
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
            repeat1(
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

        benchmark_directive: $ => new_directive("benchmark", "arguments",
            alias($.directive_parameters_wc_def, $.directive_parameters)),
        cache_directive: $ => new_directive("cache", "arguments",
            alias($.directive_parameters_wc_def, $.directive_parameters)),
        conda_directive: $ => new_directive("conda", "arguments",
            alias($.directive_parameters_wc_def, $.directive_parameters)),
        config_directive: $ => new_directive("config", "arguments",
            alias($.directive_parameters_wc_def, $.directive_parameters)),
        configfile_directive: $ => new_directive("configfile", "arguments",
            alias($.directive_parameters_wc_def, $.directive_parameters)),
        container_directive: $ => new_directive("container", "arguments",
            alias($.directive_parameters_wc_def, $.directive_parameters)),
        cwl_directive: $ => new_directive("cwl", "arguments",
            alias($.directive_parameters_wc_def, $.directive_parameters)),
        handover_directive: $ => new_directive("handover", "arguments",
            alias($.directive_parameters_wc_def, $.directive_parameters)),
        include_directive: $ => new_directive("include", "arguments",
            alias($.directive_parameters_wc_def, $.directive_parameters)),
        input_directive: $ => new_directive("input", "arguments",
            alias($.directive_parameters_wc_def, $.directive_parameters)),
        localrules_directive: $ => new_directive("localrules", "arguments",
            alias($.directive_parameters_identifiers, $.directive_parameters)),
        log_directive: $ => new_directive("log", "arguments",
            alias($.directive_parameters_wc_def, $.directive_parameters)),
        message_directive: $ => new_directive("message", "arguments",
            alias($.directive_parameters_wc_def, $.directive_parameters)),
        meta_wrapper_directive: $ => new_directive("meta_wrapper", "arguments",
            alias($.directive_parameters_wc_def, $.directive_parameters)),
        notebook_directive: $ => new_directive("notebook", "arguments",
            alias($.directive_parameters_wc_def, $.directive_parameters)),
        output_directive: $ => new_directive("output", "arguments",
            alias($.directive_parameters_wc_def, $.directive_parameters)),
        params_directive: $ => new_directive("params", "arguments",
            alias($.directive_parameters_wc_def, $.directive_parameters)),
        prefix_directive: $ => new_directive("prefix", "arguments",
            alias($.directive_parameters_wc_def, $.directive_parameters)),
        priority_directive: $ => new_directive("priority", "arguments",
            alias($.directive_parameters_wc_def, $.directive_parameters)),
        resources_directive: $ => new_directive("resources", "arguments",
            alias($.directive_parameters_wc_def, $.directive_parameters)),
        retries_directive: $ => new_directive("retries", "arguments",
            alias($.directive_parameters_wc_def, $.directive_parameters)),
        script_directive: $ => new_directive("script", "arguments",
            alias($.directive_parameters_wc_def, $.directive_parameters)),
        shadow_directive: $ => new_directive("shadow", "arguments",
            alias($.directive_parameters_wc_def, $.directive_parameters)),
        shell_directive: $ => new_directive("shell", "arguments",
            alias($.directive_parameters_wc_interp, $.directive_parameters)),
        singularity_directive: $ => new_directive("singularity", "arguments",
            alias($.directive_parameters_wc_def, $.directive_parameters)),
        skip_validation_directive: $ => new_directive("skip_validation", "arguments",
            alias($.directive_parameters_wc_def, $.directive_parameters)),
        snakefile_directive: $ => new_directive("snakefile", "arguments",
            alias($.directive_parameters_wc_def, $.directive_parameters)),
        threads_directive: $ => new_directive("threads", "arguments",
            alias($.directive_parameters_wc_def, $.directive_parameters)),
        version_directive: $ => new_directive("version", "arguments",
            alias($.directive_parameters_wc_def, $.directive_parameters)),
        wildcard_constraints_directive: $ => new_directive("wildcard_constraints", "arguments",
            alias($.directive_parameters_wc_def, $.directive_parameters)),
        workdir_directive: $ => new_directive("workdir", "arguments",
            alias($.directive_parameters_wc_def, $.directive_parameters)),
        wrapper_directive: $ => new_directive("wrapper", "arguments",
            alias($.directive_parameters_wc_def, $.directive_parameters)),

        // Directives with code blocks

        onerror_directive: $ => new_directive("onerror", "body", $._suite),
        onstart_directive: $ => new_directive("onstart", "body", $._suite),
        onsuccess_directive: $ => new_directive("onsuccess", "body", $._suite),
        run_directive: $ => new_directive("run", "body", $._suite),

        // Possible parameters vary by directive

        // Parameters for directives in which wildcards are defined
        directive_parameters_wc_def: $ => directive_parameters($, choice(
            $._directive_parameter,
            alias($.string_wc_def, $.string),
            alias($.concatenated_string_wc_def, $.concatenated_string)
        )),
        // Parameters for directives in which wildcards are interpolated
        directive_parameters_wc_interp: $ => directive_parameters($, choice(
            $._directive_parameter,
            alias($.string_wc_interp, $.string),
            alias($.concatenated_string_wc_interp, $.concatenated_string)
        )),
        directive_parameters_identifiers: $ => directive_parameters($, repeat1($.identifier)),

        _directive_parameter: $ => choice(
            $.expression,
            $.keyword_argument,
            $.list_splat,
            $.dictionary_splat
        ),

        // STRINGS
        // string: ($, original) => prec.dynamic(1, original),
        concatenated_string: ($, original) => prec.right(original),

        concatenated_string_wc_def: $ => prec.right(1, seq(
            alias(choice($.string, $.string_wc_def), $.string),
            repeat1(alias(choice($.string, $.string_wc_def), $.string))
        )),

        concatenated_string_wc_interp: $ => prec.right(1, seq(
            alias(choice($.string, $.string_wc_interp), $.string),
            repeat1(alias(choice($.string, $.string_wc_interp), $.string))
        )),

        string_wc_def: $ => seq(
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

        string_wc_interp: $ => seq(
            alias($._wildcard_interp_string_start, "\""),
            repeat(choice(
                $._string_content,
                $.escape_sequence,
                $._not_escape_sequence,
                seq("{", $.wildcard, "}"),
                $._escape_interpolation
            )),
            alias($._string_end, "\"")
        ),

        wildcard_definition: $ => seq(
            field("name", $.identifier),
            optional(field("constraints", seq(",", $.constraints))),
        ),

        wildcard: $ => choice(
            $.identifier,
            $.subscript,
            $.attribute
        ),

        // regex to match a regex ...
        // explicitly specify bracketed quantifier to consume paired
        // brackets before the external scanner gets a chance to see them.
        constraints: $ => /([^}]|(\{\d+\}))+/,
    }
});

function commaSep1(rule) {
  return sep1(rule, ',')
}

function sep1(rule, separator) {
  return seq(rule, repeat(seq(separator, rule)))
}

function new_directive(name, body_name, parameters) {
    return seq(
        name,
        ":",
        field(body_name, parameters)
    )
}

function directive_parameters($, rule) {
    return(choice(
        // Single line
        seq(
            commaSep1(rule),
            optional(","),
            $._newline
        ),
        // Indented block
        seq(
            $._indent,
            commaSep1(rule),
            $._dedent
        ),
        // On opening line + subsequently indented
        seq(
            commaSep1(rule),
            ",",
            seq(
                $._indent,
                commaSep1(rule),
                $._dedent
            ),
        )
    ))
}
