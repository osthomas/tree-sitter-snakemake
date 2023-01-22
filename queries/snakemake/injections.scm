; inherits: python

(wildcard (constraint) @regex)

;; Injection of bash in shell directives is disabled by default. To enable,
;; place the queries below in
;; $HOME/.config/nvim/queries/snakemake/injections.scm
;; Do not forget to add `; inherits: snakemake` at the top of the file.

;; bash in shell directive
;; single quote
; (
;   (directive
;     name: "shell"
;     (directive_parameters
;       (string . "\"" @_string_start) @bash))
;   (#any-of? @_string_start "\"" "'")
;   (#offset! @bash 0 1 0 -1)
; )

;; triple quotes
; (
;   (directive
;     name: "shell"
;     (directive_parameters
;       (string . "\"" @_string_start) @bash))
;   (#any-of? @_string_start "\"\"\"" "'''")
;   (#offset! @bash 0 3 0 -3)
; )
