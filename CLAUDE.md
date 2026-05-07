# Project: nl-to-sql

A NestJS service that converts natural language questions into SQL queries,
executes them against SQLite, and returns natural language responses.
Built as a portfolio piece demonstrating production-quality engineering on
top of the LangChain RAG pattern.

## Stack

- **Runtime:** Node.js 20+
- **Framework:** NestJS 11+
- **Language:** TypeScript (strict mode)
- **LLM:** Google Gemini (gemini-2.5-flash-lite) via LangChain.js
- **Database:** SQLite (better-sqlite3 driver)
- **Testing:** Jest

## Goals

- Single POST endpoint: `POST /query` accepts a natural language question, returns a natural language answer.
- Three-phase RAG pipeline: query generation, validation, execution, response generation.
- Production-quality code structure suitable for portfolio presentation.
- Clear separation of concerns via NestJS modules and dependency injection.

## Out of Scope (v1)

- Authentication, authorization, multi-tenancy
- Rate limiting, request throttling
- Multiple LLM providers (Gemini only)
- Multiple database dialects (SQLite only)
- Streaming responses (synchronous only)
- Docker, CI/CD pipelines
- Caching layers
- Observability/tracing infrastructure (basic logging only)

These may be added in future iterations. Do not introduce them in v1
unless explicitly requested.

## Architecture

```
POST /query  →  QueryController
                    ↓
                QueryService.query(naturalLanguage)
                    ↓
                QueryGenerationChain.invoke()    [LLM call #1: NL → SQL]
                    ↓
                SqlValidator.validate()          [safety + LIMIT enforcement]
                    ↓
                DatabaseService.execute()        [SQLite query]
                    ↓
                ResponseGenerationChain.invoke() [LLM call #2: results → NL]
                    ↓
                return naturalLanguageResponse
```

## Project Structure

```
src/
├── main.ts
├── app.module.ts
├── query/
│   ├── query.module.ts
│   ├── query.controller.ts          (POST /query — coming in later step)
│   ├── query.service.ts             (chain orchestration — coming in later step)
│   ├── chains/                      (coming in later step)
│   ├── prompts/                     (coming in later step)
│   ├── validators/
│   │   └── sql.validator.ts         (Step 3 — done)
│   ├── dto/                         (coming in later step)
│   └── exceptions/
│       └── unsafe-sql.exception.ts  (Step 3 — done)
├── database/
│   ├── database.module.ts
│   ├── database.service.ts
│   └── exceptions/
│       └── database-connection.exception.ts
└── config/
    └── env.validation.ts
```

## Code Conventions

### Architecture First

Before implementing any new feature, confirm:
- Which module does this belong in (existing or new)?
- Is this controller logic or service logic?
- Should this be a separate runnable in the chain or inline?

Never assume structure decisions. Confirm before writing.

### NestJS Patterns

- Business logic always lives in services, never in controllers.
- Controllers handle HTTP concerns only: request parsing, response shaping, status codes.
- Use DTOs with `class-validator` for every request and response shape.
- Use Pipes for validation and transformation, never inline validation in controllers.
- Use Guards for authorization (not yet needed in v1).
- Use Interceptors for cross-cutting response transformation (logging only in v1).
- Custom exceptions extend `HttpException` with proper HTTP status codes.
- Repository pattern for database access — services depend on `DatabaseService`,
  never on `better-sqlite3` directly.

### Clean Code Principles

- Meaningful, descriptive names. No abbreviations except universally understood ones (`db`, `id`, `url`).
- Small functions with single responsibility.
- SOLID principles, especially Dependency Injection and Single Responsibility.
- No magic strings or numbers — use enums or named constants.
- Early returns over deep nesting.
- Async/await, never `.then()` chains.
- No `any` type — prefer `unknown` and narrow with type guards.

### File Conventions

- One class per file (with rare pragmatic exceptions like co-located DTOs).
- File names: kebab-case (`query.service.ts`, `sql.validator.ts`).
- Class names: PascalCase (`QueryService`, `SqlValidator`).
- Test files: colocated, ending in `.spec.ts`.

## Common Terminology

- **DTO** — Data Transfer Object, request/response shapes
- **Chain** — A LangChain `RunnableSequence` composing prompts, models, and lambdas
- **Prompt template** — A reusable `PromptTemplate` with placeholders
- **Validator** — Either a NestJS pipe or a domain validator (e.g., SQL safety check)
- **Guard** — NestJS auth middleware
- **Interceptor** — Request/response transformer
- **Module** — NestJS feature boundary

## Testing

- Unit tests for pure logic: validators, formatters, prompt builders.
- Integration tests for services with mocked LLM via `jest.fn()`.
- Use in-memory SQLite for database tests, never the real seeded DB.
- Critical-path coverage is the goal, not 100%.

## SQL Safety Rules

The `SqlValidator` enforces:
- Only `SELECT` statements pass.
- Forbidden keywords: `DROP`, `DELETE`, `TRUNCATE`, `ALTER`, `CREATE`, `INSERT`, `UPDATE`, `GRANT`, `REVOKE`.
- `LIMIT` clause is auto-appended if absent (default 100 rows).
- Markdown code fences (```) are stripped before validation.

The LLM is not trusted to enforce these — the validator does, every time.

## What to Avoid

- Do not introduce features outside the v1 scope listed above.
- Do not refactor existing code unless explicitly asked.
- Do not add comments explaining what code does — only why, when non-obvious.
- Do not write defensive code for impossible states; trust types.
- Do not catch and swallow exceptions silently. Either handle meaningfully or let them propagate.
- Do not use generic `Error` — throw domain-specific exception classes.
- Do not bypass DI by importing concrete classes; depend on injected interfaces or services.

## Feedback Loop

When implementing:
1. Confirm understanding of the architectural placement before writing code.
2. Show structure (file tree, class signatures) before full implementation.
3. Production-ready code only — no toy examples or placeholder logic.
4. Focus on WHY, not just HOW, in any explanation.