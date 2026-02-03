# BAK — Open Compatibility Ledger

A high-performance, enterprise-grade financial ledger designed for correctness, determinism, and strict adherence to Clean Architecture and Domain-Driven Design (DDD) principles.

## 🎯 Project Vision

The **BAK Open Compatibility Ledger** is built to be a long-living enterprise system. It prioritizes financial accuracy and data isolation over development speed, ensuring every transaction is traceable, immutable (once posted), and strictly isolated within multi-tenant boundaries.

## 🏗️ Architectural Pillars

The project follows a strict **Clean Architecture** model:

-   **Core (Domain & Application)**: Contains all business logic, entities, and use cases. It has ZERO dependencies on external frameworks or databases.
-   **Infrastructure**: Implements persistence (Prisma), cryptography (JWE), and external adapters.
-   **Presentation**: Handles the "driving" side of the application (CLI, API Controllers).

### Key Decisions
-   **Multi-tenancy**: First-class citizen. Data isolation is enforced at the repository level.
-   **Deterministic Math**: Uses `CsDecimal` (128-bit) to avoid JavaScript's floating-point errors.
-   **Strict Typing**: Leverages `dotnet-node-core` for .NET-like primitives (`Guid`, `List`, `Dictionary`) in a TypeScript environment.
-   **Security**: Uses JSON Web Encryption (JWE) for sensitive payload protection.

## 📂 Project Structure

```text
src/
├── Core/
│   ├── Domain/          # Entities (Account, JournalEntry), Value Objects, Enums
│   ├── Application/     # Use Cases (CreateJournalEntry, PostJournalEntry)
│   └── Interfaces/      # Repository and Service abstractions
├── Infrastructure/      # Prisma implementations, Auth, DI setup
└── Presentation/        # Demo script, Controllers (API)
docs/                    # Project documentation (Architecture, Schema, CLI Design)
prisma/                  # Database Schema and Migrations
tests/                   # Unit, Integration, and Performance tests
```

### 📚 Further Documentation
-   [Architecture Philosophy](file:///c:/Users/fabio/_WORKER_/Personal/bak-open-ledger/docs/architecture.md): Core principles and Clean Architecture rules.
-   [Database Schema](file:///c:/Users/fabio/_WORKER_/Personal/bak-open-ledger/docs/database-schema.md): Detailed model descriptions and field meanings.
-   [Functional CLI Design](file:///c:/Users/fabio/_WORKER_/Personal/bak-open-ledger/docs/cli-design.md): Roadmap for the upcoming interactive CLI.

## 🛠️ CLI Usage

The functional CLI allows you to manage the ledger directly from your terminal.

### Global Options
-   `--help`: Show help for any command.

### Tenant Management
```bash
npm run cli tenant list             # List all registered tenants
npm run cli tenant create           # Create a new tenant (interactive)
npm run cli tenant set-active <id>  # Set context for subsequent commands
```

### Account Management (requires active tenant)
```bash
npm run cli account list            # List Chart of Accounts
npm run cli account create          # Add a new account
```

### Journal Entries
```bash
npm run cli journal-entry create    # Start the interactive entry wizard
npm run cli journal-entry post <id> # Post a draft entry
```

### Functional Demo
If you want to see a full automated flow from scratch:
```bash
npm run demo
```

## 🧪 Testing

We maintain high standards for testing, including logic verification and performance audits.
```bash
npm test          # Run all tests
npm run test:cov  # Run tests with coverage report
```

---
*Built with precision for the next generation of financial systems.*
