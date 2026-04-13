Review the codebase (or the specified file/directory: $ARGUMENTS) for technical debt. Identify and report on:

1. **Code duplication** — repeated logic that should be extracted into shared utilities or hooks
2. **Dead code** — unused variables, functions, imports, or components
3. **Overly complex logic** — functions doing too much, deeply nested conditionals, long files
4. **Missing abstractions** — patterns repeated 3+ times that warrant a shared helper
5. **Inconsistent patterns** — places that deviate from conventions established elsewhere in the codebase
6. **Prop drilling / state management issues** — data passed through many layers unnecessarily
7. **Type safety gaps** — use of `any`, missing types, unsafe casts
8. **Stale TODOs/FIXMEs** — comments indicating known problems left unresolved

For each issue found:
- State the file and line number
- Describe the problem concisely
- Suggest a specific fix or refactor

Prioritize by impact: high (causes bugs or blocks future work), medium (slows development), low (cosmetic/minor).

Do not suggest adding features, only cleaning up existing code. Focus on what is actually present, not hypothetical improvements.
