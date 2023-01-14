const PYTHON = require("tree-sitter-python/grammar")
module.exports = grammar(PYTHON, {
    // For reference, see:
    // https://snakemake.readthedocs.io/en/stable/snakefiles/writing_snakefiles.html#grammar
    // However, the grammar described therein is incomplete.
    name: "snakemake",

    conflicts: ($, original) => original.concat([
        [$._rule_import_list, $.rule_inheritance],
    ]),

    inline: ($, original) => original.concat([
        $.directive_parameters_identifiers
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
            $.directive_parameters),
        cache_directive: $ => new_directive("cache", "arguments",
            $.directive_parameters),
        conda_directive: $ => new_directive("conda", "arguments",
            $.directive_parameters),
        config_directive: $ => new_directive("config", "arguments",
            $.directive_parameters),
        configfile_directive: $ => new_directive("configfile", "arguments",
            $.directive_parameters),
        container_directive: $ => new_directive("container", "arguments",
            $.directive_parameters),
        cwl_directive: $ => new_directive("cwl", "arguments",
            $.directive_parameters),
        handover_directive: $ => new_directive("handover", "arguments",
            $.directive_parameters),
        include_directive: $ => new_directive("include", "arguments",
            $.directive_parameters),
        input_directive: $ => new_directive("input", "arguments",
            $.directive_parameters),
        localrules_directive: $ => new_directive("localrules", "arguments",
            $.directive_parameters_identifiers),
        log_directive: $ => new_directive("log", "arguments",
            $.directive_parameters),
        message_directive: $ => new_directive("message", "arguments",
            $.directive_parameters),
        meta_wrapper_directive: $ => new_directive("meta_wrapper", "arguments",
            $.directive_parameters),
        notebook_directive: $ => new_directive("notebook", "arguments",
            $.directive_parameters),
        output_directive: $ => new_directive("output", "arguments",
            $.directive_parameters),
        params_directive: $ => new_directive("params", "arguments",
            $.directive_parameters),
        prefix_directive: $ => new_directive("prefix", "arguments",
            $.directive_parameters),
        priority_directive: $ => new_directive("priority", "arguments",
            $.directive_parameters),
        resources_directive: $ => new_directive("resources", "arguments",
            $.directive_parameters),
        retries_directive: $ => new_directive("retries", "arguments",
            $.directive_parameters),
        script_directive: $ => new_directive("script", "arguments",
            $.directive_parameters),
        shadow_directive: $ => new_directive("shadow", "arguments",
            $.directive_parameters),
        shell_directive: $ => new_directive("shell", "arguments",
            $.directive_parameters),
        singularity_directive: $ => new_directive("singularity", "arguments",
            $.directive_parameters),
        skip_validation_directive: $ => new_directive("skip_validation", "arguments",
            $.directive_parameters),
        snakefile_directive: $ => new_directive("snakefile", "arguments",
            $.directive_parameters),
        threads_directive: $ => new_directive("threads", "arguments",
            $.directive_parameters),
        version_directive: $ => new_directive("version", "arguments",
            $.directive_parameters),
        wildcard_constraints_directive: $ => new_directive("wildcard_constraints", "arguments",
            $.directive_parameters),
        workdir_directive: $ => new_directive("workdir", "arguments",
            $.directive_parameters),
        wrapper_directive: $ => new_directive("wrapper", "arguments",
            $.directive_parameters),

        // Directives with code blocks

        onerror_directive: $ => new_directive("onerror", "body", $._suite),
        onstart_directive: $ => new_directive("onstart", "body", $._suite),
        onsuccess_directive: $ => new_directive("onsuccess", "body", $._suite),
        run_directive: $ => new_directive("run", "body", $._suite),

        directive_parameters: $ => directive_parameters($, choice(
            $._directive_parameter
        )),

        _directive_parameters_identifiers: $ => directive_parameters($, repeat1($.identifier)),

        directive_parameters_identifiers: $ => alias(
            $._directive_parameters_identifiers,
            $.directive_parameters
        ),

        _directive_parameter: $ => choice(
            $.expression,
            $.keyword_argument,
            $.list_splat,
            $.dictionary_splat
        ),

        // STRINGS
        concatenated_string: ($, original) => prec.right(original)
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
