module mod:
#^^^^^ keyword
#      ^^^ type
    snakefile: "module.smk"
#   ^^^^^^^^^ label
    config: config["module"]
#   ^^^^^^ label
#           ^^^^^^ variable.builtin


use rule ruleA, ruleB from mod exclude ruleA as mod*
#^^ keyword.import
#   ^^^^ keyword.import
#                     ^^^^ keyword.import
#                              ^^^^^^^ keyword.import
#                                            ^^ keyword.import

use rule ruleA, ruleB from mod as mod*
#^^ keyword.import
#   ^^^^ keyword.import
#                     ^^^^ keyword.import
#                              ^^ keyword.import

use rule * from mod as mod*
#^^ keyword.import
#   ^^^^ keyword.import
#           ^^^^ keyword.import
#                   ^^ keyword.import

use rule ruleA as ruleAother with:
#^^ keyword
#   ^^^^ keyword
#                            ^^^^ keyword
    params: "other"
#   ^^^^^^ label
