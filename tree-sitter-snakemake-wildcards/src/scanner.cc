#include <tree_sitter/parser.h>


namespace {
    enum TokenType {
        STRING_CONTENT
    };


    struct Scanner {

        Scanner() {
            deserialize(NULL, 0);
        }

        // There is no state to store for this Scanner
        unsigned serialize(char *buffer) {
            size_t i = 0;
            return i;
        }

        void deserialize(const char *buffer, unsigned length) {
        }

        bool scan(TSLexer *lexer, const bool *valid_symbols) {
            if (valid_symbols[STRING_CONTENT]) {
                return parse_contents(lexer, valid_symbols);
            } else {
                return false;
            }
        }

        bool parse_contents(TSLexer *lexer, const bool *valid_symbols) {
            // Emit STRING_CONTENT until hitting a }
            bool has_content = false;
            lexer->result_symbol = STRING_CONTENT;
            while (lexer->lookahead != '{' && !lexer->eof(lexer)) {
                has_content = true;
                lexer->advance(lexer, false);
                lexer->mark_end(lexer);
            }
            if (lexer->lookahead == '{') {
                consume_brackets(lexer);
            }
            return has_content;
        }

        // Consume brackets until the last one.
        void consume_brackets(TSLexer *lexer) {
            while (lexer->lookahead == '{') {
                lexer->mark_end(lexer);
                lexer->advance(lexer, false);
            }
        }
    };
}

extern "C" {
    void *tree_sitter_snakemake_wildcards_external_scanner_create() {
        return new Scanner();
    }

    bool tree_sitter_snakemake_wildcards_external_scanner_scan(
        void *payload,
        TSLexer *lexer,
        const bool *valid_symbols
    ) {
        Scanner *scanner = static_cast<Scanner *>(payload);
        return scanner->scan(lexer, valid_symbols);
    }

    unsigned tree_sitter_snakemake_wildcards_external_scanner_serialize(
        void *payload,
        char* buffer
    ) {
        Scanner *scanner = static_cast<Scanner *>(payload);
        return scanner->serialize(buffer);
    }

    void tree_sitter_snakemake_wildcards_external_scanner_deserialize(
        void *payload,
        char* buffer,
        unsigned length
    ) {
        Scanner *scanner = static_cast<Scanner *>(payload);
        scanner->deserialize(buffer, length);
    }

    void tree_sitter_snakemake_wildcards_external_scanner_destroy(void *payload) {
        Scanner *scanner = static_cast<Scanner *>(payload);
        delete scanner;
    }
}
