# tree-sitter-snakemake

[![CI](https://github.com/osthomas/tree-sitter-snakemake/workflows/CI/badge.svg)](https://github.com/osthomas/tree-sitter-snakemake/actions)

**Work in Progress**

A tree-sitter grammar for
[snakemake](https://snakemake.readthedocs.io/en/stable/),
a workflow management system.

Snakemake is an extension of Python, and tree-sitter-snakemake is an extension
of [tree-sitter-python](https://github.com/tree-sitter/tree-sitter-python).


## Using the parser in neovim

tree-sitter-snakemake is not yet a part of
[nvim-treesitter](https://github.com/nvim-treesitter/nvim-treesitter), but you
can already add it manually.

1. Add the following to `$HOME/.config/nvim/init.lua`:

```lua
local parser_config = require "nvim-treesitter.parsers".get_parser_configs()
parser_config.snakemake = {
  install_info = {
    url = "https://github.com/osthomas/tree-sitter-snakemake",
    location = "tree-sitter-snakemake",
    files = {"src/parser.c", "src/scanner.c"},
    branch = "main",
    requires_generate_from_grammar = false
  }
}
```

2. Copy the contents of
   [queries/snakemake](https://github.com/osthomas/tree-sitter-snakemake/tree/main/queries/snakemake)
   in this repository to `$HOME/.config/nvim/queries/snakemake`

3. Make sure the filetype of your file is set to `snakemake`.

```vim
:set filetype=snakemake
```
