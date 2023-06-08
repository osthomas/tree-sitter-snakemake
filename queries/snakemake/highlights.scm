; inherits: python

;; Compound directives
["rule" "checkpoint" "module"] @keyword

;; Simple directives
(directive name: _ @keyword)


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
;; as @field for consistency with attributes in wildcard interpolations
(wildcard (identifier) @field)


;; Keywords in wildcard interpolations
(
  (identifier) @keyword
  (#has-ancestor? @keyword "directive")
  (#has-ancestor? @keyword "block")
  (#any-of? @keyword
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

(
  (identifier) @keyword
  (#has-ancestor? @keyword "wildcard")
  (#any-of? @keyword
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
