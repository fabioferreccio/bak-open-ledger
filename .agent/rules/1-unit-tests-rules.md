# 1-unit-tests-rules.md — Testing Standards

## Rule 1: Scope & Philosophy
1.  **Focus on Core**: The primary objective of Unit Tests is to verify the behavior of the **Core (Domain)** layer.
2.  **Zero I/O**: Unit tests MUST NOT access the file system, network, or real database.
3.  **Mocking**: Infrastructure dependencies (repositories, encryption, etc.) MUST be mocked.

## Rule 2: Tooling & Location
1.  **Framework**: All tests MUST use `ts-jest`.
2.  **Location**: Test files should mirror the source structure in a `tests/` directory or run alongside source files (e.g., `src/__tests__` or `*.spec.ts`), depending on the project convention.
    -   *Standard*: Files MUST end with `.spec.ts`.

## Rule 3: Coverage Requirements
1.  **100% Core Coverage**:
    -   **Domain Entities**: 100% Line & Branch coverage.
    -   **Value Objects**: 100% Line & Branch coverage.
    -   **Domain Services**: 100% Line & Branch coverage.
2.  **Behavioral Assertion**: Tests must assert **behavior** and **state changes**, not just constructor execution.

## Rule 4: Test Quality
1.  **No Tautologies**: Tests that duplicate the implementation logic to "verify" it are forbidden.
2.  **No Snapshot Abuse**: Snapshots should be used sparingly and never for critical logic verification. Explicit assertions are required.
3.  **Descriptive Naming**: Test descriptions (it/test blocks) must describe the business rule being verified, not the function name.
    -   *Bad*: `it('should call save', ...)`
    -   *Good*: `it('should reject posting if fiscal period is closed', ...)`
4.  **Arrange-Act-Assert**: All tests must follow the AAA pattern clearly.
