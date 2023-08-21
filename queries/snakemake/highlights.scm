; inherits: python

;; Compound directives
["rule" "checkpoint" "module"] @keyword

;; Top level directives (eg. configfile, include)
(module (directive name: _ @keyword))

;; Subordinate directives (eg. input, output)
(_ body: (_ (directive name: _ @label)))

;; rule/module/checkpoint names
(rule_definition name: (identifier) @type)
(module_definition name: (identifier) @type)
(checkpoint_definition name: (identifier) @type)


;; Rule imports
(rule_import
  "use" @include
  "rule" @include
  "from" @include
  "as"? @include
  "with"? @include
)


;; Rule inheritance
(rule_inheritance
  "use" @keyword
  "rule" @keyword
  "with" @keyword
)


;; Wildcard names
(wildcard (identifier) @variable)


;; References to directive labels in wildcard interpolations
(
  (identifier) @label
  (#has-ancestor? @label "directive")
  (#has-ancestor? @label "block")
  (#any-of? @label
      "config"
      "input"
      "log"
      "output"
      "params"
      "resources"
      "threads"
      "wildcards"
   )
)

((wildcard (identifier) @label)
  (#any-of? @label "config" "input" "log" "output" "params" "resources" "threads" "wildcards"))
((wildcard (attribute object: (identifier) @label))
  (#any-of? @label "config" "input" "log" "output" "params" "resources" "threads" "wildcards"))
