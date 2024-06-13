# tree-sitter-snakemake

[![CI](https://github.com/osthomas/tree-sitter-snakemake/workflows/CI/badge.svg)](https://github.com/osthomas/tree-sitter-snakemake/actions)

A tree-sitter grammar for
[snakemake](https://snakemake.readthedocs.io/en/stable/),
a workflow management system.

Snakemake is an extension of Python, and tree-sitter-snakemake is an extension
of [tree-sitter-python](https://github.com/tree-sitter/tree-sitter-python).


## Using the parser in neovim

tree-sitter-snakemake is in
[nvim-treesitter](https://github.com/nvim-treesitter/nvim-treesitter)!

Make sure the `filetype` of your file is set to `snakemake`.

```vim
:set filetype=snakemake
```
