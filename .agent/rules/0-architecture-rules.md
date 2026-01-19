# 0-architecture-rules.md — The Constitution

These rules are **ABSOLUTE**. Violation constitutes a failed build.

## Rule 1: Strict Layering
1.  **Core Isolation**: The `src/Core` directory (or equivalent Domain layer package) MUST NOT import from `src/Infrastructure`, `src/Presentation`, or `node_modules` (except `dotnet-node-core`).
2.  **Dependency Flow**: Dependencies point INWARD.
    -   Presentation -> Core
    -   Infrastructure -> Core
    -   Core -> (nothing)

## Rule 2: Primitives & Types
1.  **No Native Floating Point**: The use of native JavaScript `number` for ANY financial or quantity value is **FORBIDDEN**. You MUST use `CsDecimal`.
2.  **No Native Dates**: The use of native JavaScript `Date` for business logic dates is **FORBIDDEN**. You MUST use `CsDateTime`.
3.  **Strict Identifiers**: All Domain Entities MUST use `Guid` for identity. String IDs are forbidden in the domain model.

## Rule 3: Rich Domain Models
1.  **Behavior Over Data**: Entities MUST encapsulate logic. "Anemic" data-bag classes with public setters are **FORBIDDEN**.
2.  **Invariants**: Construction of an entity MUST guarantee its validity. Invalid states are unrepresentable or throw immediate exceptions.
3.  **Encapsulation**: Internal state should be private or protected. Modification happens only via explicit methods (e.g., `post()`, `correct()`), never via property assignment.

## Rule 4: Multi-tenancy & Isolation
1.  **Mandatory Tenant Filter**: Every database query fetching an Aggregate Root MUST include an explicit `tenantId` clause.
2.  **Scope Safety**: A Tenant MUST NEVER be able to access or modify another Tenant's data. Cross-tenant transactions are forbidden unless explicitly designed for administration.

## Rule 5: Repository Contract
1.  **Domain Return Types**: Repositories defined in Core and implemented in Infrastructure MUST return **Domain Entities**, NOT Prisma Generated Types (DTOs).
2.  **Mapping**: The Infrastructure layer is responsible for mapping robust Domain Entities <-> Database Records.
