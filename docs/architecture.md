# Architecture Documentation

## 1. Architectural Philosophy

The **BAK — Open Compatibility Ledger** is designed as a long-living enterprise system. It prioritizes correctness, determinism, and strict adherence to specific architectural patterns over development speed or convenience.

### Core Pillars

1.  **Clean Architecture**: The system implements a strict dependency rule where the `Core` (Domain) layer has no dependencies on outer layers (Infrastructure, Presentation).
2.  **Domain-Driven Design (DDD)**: The complexity of the software is tackled by the richness of the domain model. We avoid "anemic" models; behavioral logic resides in entities.
3.  **Explicit Multi-tenancy**: Multi-tenancy is a first-class citizen. Data isolation is enforced at the root level of all aggregate queries.
4.  **Write / Read Separation**: The architecture is prepared for CQRS (Command Query Responsibility Segregation). Writes target the normalized domain model, while reads can be optimized for projection.
5.  **Deterministic Behavior**: We strive for 100% deterministic behavior in business logic, aided by strict typing and immutable value objects where appropriate.

---

## 2. Layer Definition

The application is strictly divided into three concentric layers.

### 2.1. Core Layer (The Inner Circle)

This layer contains the Enterprise Business Rules.

-   **Responsibility**: Defines the Core API, Entities, Value Objects, Domain Services, and Use Case Interfaces. It encapsulates the invariant logic of the business.
-   **Allowed Dependencies**:
    -   `dotnet-node-core`: For strict types (`CsDecimal`, `CsDateTime`, `Guid`, `List`, `Dictionary`).
    -   **NO OTHER EXTERNAL DEPENDENCIES**.
-   **Forbidden Dependencies**:
    -   No Prisma or Database drivers.
    -   No IO (File System, Network).
    -   No Encryption libraries (implementation details).
    -   No Web Frameworks (Express, Fastify).
-   **Key Components**:
    -   **Entities**: Objects with Identity (e.g., `JournalEntry`). MUST encompass behavior.
    -   **Value Objects**: Immutable objects defined by their attributes (e.g., `Money`).
    -   **Repository Interfaces**: Abstractions for data access (e.g., `IJournalEntryRepository`).
    -   **Domain Services**: Logic that doesn't naturally fit an entity (e.g., `ExchangeRateCalculator`).

### 2.2. Infrastructure Layer (The Adapters)

This layer adapts the Core to the outside world.

-   **Responsibility**: Implement interfaces defined in Core. Handle persistence, external messaging, and cryptography.
-   **Allowed Dependencies**:
    -   Core Layer.
    -   Prisma Client (`@prisma/client`).
    -   Cryptography libraries (`jose`).
    -   Node.js native modules.
-   **Components**:
    -   **Persistence**: Prisma implementations of Repository interfaces. Mapping from Prisma types to Domain Entities.
    -   **Auth**: JWE implementation for payload encryption/decryption.
    -   **Adapters**: Implementations for third-party services.

### 2.3. Presentation Layer (The UI/API)

This layer drives the application.

-   **Responsibility**: Accept user input, convert it to Core-compatible structures, invoke Use Cases, and present the output.
-   **Allowed Dependencies**:
    -   Core Layer (Interfaces & DTOs).
    -   Web Frameworks (Fastify, Express) or CLI tools.
-   **Forbidden Dependencies**:
    -   Direct access to Infrastructure concrete classes (Dependency Injection must be used).
    -   Direct DB access (bypass Core).

---

## 3. Explicit Architectural Decisions

The following decisions are **BINDING** and serve as the source of truth.

### 3.1. Monetary Types
-   **Decision**: Money values MUST be represented using `CsDecimal` from `dotnet-node-core`.
-   **Reasoning**: JavaScript `number` is a 64-bit float, which introduces floating-point errors unacceptable for financial ledgers. `CsDecimal` provides 128-bit decimal precision suitable for accounting.
-   **Constraint**: NEVER use `number` for generic monetary amounts in the Domain.

### 3.2. Identifiers
-   **Decision**: All Entity IDs MUST be `Guid` from `dotnet-node-core`.
-   **Reasoning**: GUIDs allow decentralized ID generation and are consistent across distributed systems. Strings are ambiguous and prone to format errors.

### 3.3. Security & Cryptography
-   **Decision**: JSON Web Encryption (JWE) MUST be used for sensitive payloads.
-   **Implementation**: This is an implementation detail of the Infrastructure layer. The Core layer defines the contract (e.g., `IEncryptionProvider`).

### 3.4. Multi-tenancy Enforcement
-   **Decision**: Application-level enforcement via Tenant ID.
-   **Rule**: Every Aggregate Root repository method MUST require `tenantId` as a parameter or context.
-   **Query Rule**: `WHERE tenantId = ?` is mandatory on all top-level queries.

### 3.5. Write / Read Separation
-   **Decision**: The system distinguishes between "Mutating State" (Writes) and "Viewing State" (Reads).
-   **Read Model**: For high-performance reporting, we may bypass Domain Entities and project directly to DTOs, but this MUST NOT bypass security/tenant checks.
-   **Write Model**: ACID transactions are mandatory. All writes MUST go through the distinct Domain Aggregates to ensure invariants are strictly upheld.
