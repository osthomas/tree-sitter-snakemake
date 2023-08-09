; inherits: python

;; Compound directives
["rule" "checkpoint" "module"] @keyword

;; Top level directives (eg. configfile, include)
(module (directive name: _ @keyword))

;; Subordinate directives (eg. input, output)
(_ body: (_ (directive name: _ @attribute)))

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
(wildcard (identifier) @parameter)


;; References to directive attributes in wildcard interpolations
(
  (identifier) @attribute
  (#has-ancestor? @attribute "directive")
  (#has-ancestor? @attribute "block")
  (#any-of? @attribute
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

((wildcard (identifier) @attribute)
  (#any-of? @attribute "config" "input" "log" "output" "params" "resources" "threads" "wildcards"))
((wildcard (attribute object: (identifier) @attribute))
  (#any-of? @attribute "config" "input" "log" "output" "params" "resources" "threads" "wildcards"))
