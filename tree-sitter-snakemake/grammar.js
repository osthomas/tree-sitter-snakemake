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

    conflicts: ($, original) => original.concat([
        [$._rule_import_list, $.rule_inheritance],
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
            $.configfile_directive,
            $.container_directive,
            $.envvars_directive,
            $.include_directive,
            $.localrules_directive,
            $.onerror_directive,
            $.onstart_directive,
            $.onsuccess_directive,
            $.pepfile_directive,
            $.pepschema_directive,
            $.ruleorder_directive,
            $.scattergather_directive,
            $.version_directive,
            $.wildcard_constraints_directive,
            $.workdir_directive
        ), $.directive),

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
            field('body', $.rule_body)
        ),

        checkpoint_definition: $ => seq(
            "checkpoint",
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

        _rule_directive: $ => alias(choice(
            $.input_directive,
            $.output_directive,
            $.params_directive,
            $.log_directive,
            $.benchmark_directive,
            $.cache_directive,
            $.default_target_directive,
            $.envmodules_directive,
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
            $.wildcard_constraints_directive,
            $.template_engine_directive
        ), $.directive),

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

        _module_directive: $ => alias(choice(
            $.config_directive,
            $.meta_wrapper_directive,
            $.prefix_directive,
            $.skip_validation_directive,
            $.snakefile_directive
        ), $.directive),

        // DIRECTIVES

        // Directives with parameters

        benchmark_directive: $ => new_directive("benchmark", "arguments",
            $._directive_parameters_wc_def),
        cache_directive: $ => new_directive("cache", "arguments",
            $._directive_parameters_wc_none),
        conda_directive: $ => new_directive("conda", "arguments",
            $._directive_parameters_wc_none),
        config_directive: $ => new_directive("config", "arguments",
            $._directive_parameters_wc_none),
        configfile_directive: $ => new_directive("configfile", "arguments",
            $._directive_parameters_wc_none),
        container_directive: $ => new_directive("container", "arguments",
            $._directive_parameters_wc_none),
        cwl_directive: $ => new_directive("cwl", "arguments",
            $._directive_parameters_wc_none),
        default_target_directive: $ => new_directive("default_target", "arguments",
            $._directive_parameters_wc_none),
        envvars_directive: $ => new_directive("envvars", "arguments",
            $._directive_parameters_wc_none),
        envmodules_directive: $ => new_directive("envmodules", "arguments",
            $._directive_parameters_wc_none),
        handover_directive: $ => new_directive("handover", "arguments",
            $._directive_parameters_wc_none),
        include_directive: $ => new_directive("include", "arguments",
            $._directive_parameters_wc_none),
        input_directive: $ => new_directive("input", "arguments",
            $._directive_parameters_wc_def),
        localrules_directive: $ => new_directive("localrules", "arguments",
            $._directive_parameters_identifiers),
        log_directive: $ => new_directive("log", "arguments",
            $._directive_parameters_wc_def),
        message_directive: $ => new_directive("message", "arguments",
            $._directive_parameters_wc_interp),
        meta_wrapper_directive: $ => new_directive("meta_wrapper", "arguments",
            $._directive_parameters_wc_none),
        notebook_directive: $ => new_directive("notebook", "arguments",
            $._directive_parameters_wc_interp),
        output_directive: $ => new_directive("output", "arguments",
            $._directive_parameters_wc_def),
        params_directive: $ => new_directive("params", "arguments",
            $._directive_parameters_wc_none),
        pepfile_directive: $ => new_directive("pepfile", "arguments",
            $._directive_parameters_wc_none),
        pepschema_directive: $ => new_directive("pepschema", "arguments",
            $._directive_parameters_wc_none),
        prefix_directive: $ => new_directive("prefix", "arguments",
            $._directive_parameters_wc_none),
        priority_directive: $ => new_directive("priority", "arguments",
            $._directive_parameters_wc_none),
        resources_directive: $ => new_directive("resources", "arguments",
            $._directive_parameters_wc_none),
        retries_directive: $ => new_directive("retries", "arguments",
            $._directive_parameters_wc_none),
        ruleorder_directive: $ => new_directive("ruleorder", "arguments",
            $._directive_parameters_ruleorder),
        script_directive: $ => new_directive("script", "arguments",
            $._directive_parameters_wc_interp),
        shadow_directive: $ => new_directive("shadow", "arguments",
            $._directive_parameters_wc_none),
        shell_directive: $ => new_directive("shell", "arguments",
            $._directive_parameters_wc_interp),
        singularity_directive: $ => new_directive("singularity", "arguments",
            $._directive_parameters_wc_none),
        skip_validation_directive: $ => new_directive("skip_validation", "arguments",
            $._directive_parameters_wc_none),
        scattergather_directive: $ => new_directive("scattergather", "arguments",
            $._directive_parameters_wc_none),
        snakefile_directive: $ => new_directive("snakefile", "arguments",
            $._directive_parameters_wc_none),
        template_engine_directive: $ => new_directive("template_engine", "arguments",
            $._directive_parameters_wc_none),
        threads_directive: $ => new_directive("threads", "arguments",
            $._directive_parameters_wc_none),
        version_directive: $ => new_directive("version", "arguments",
            $._directive_parameters_wc_none),
        wildcard_constraints_directive: $ => new_directive("wildcard_constraints", "arguments",
            $._directive_parameters_wc_none),
        workdir_directive: $ => new_directive("workdir", "arguments",
            $._directive_parameters_wc_none),
        wrapper_directive: $ => new_directive("wrapper", "arguments",
            $._directive_parameters_wc_none),

        // Directives with code blocks

        onerror_directive: $ => new_directive("onerror", "body", $._suite),
        onstart_directive: $ => new_directive("onstart", "body", $._suite),
        onsuccess_directive: $ => new_directive("onsuccess", "body", $._suite),
        run_directive: $ => new_directive("run", "body", $._suite),

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
        __directive_parameters_identifiers: $ => directive_parameters($, repeat1($.identifier)),
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
            $._string_start,
            repeat(choice(
                $.interpolation,
                $._escape_interpolation,
                $.escape_sequence,
                $._not_escape_sequence,
                $.wildcard,
                $._string_content,
            )),
            $._string_end
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

        _wildcard_interpolation: $ => seq(
            $._WILDCARD_INTERP_OPEN,
            "{",
            choice(
                $.identifier,
                $.attribute,
                $.subscript
            ),
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

function commaSep1(rule) {
  return sep1(rule, ',')
}

function sep1(rule, separator) {
  return seq(rule, repeat(seq(separator, rule)))
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
