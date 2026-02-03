# Functional CLI Design (Phase 2)

This document outlines the roadmap for implementing a real, interactive Command Line Interface (CLI) for the **BAK Open Compatibility Ledger**.

## 🎯 Objectives
-   Transition from a hard-coded demo script to a dynamic tool.
-   Allow users to manage Tenants, Accounts, and Journal Entries via shell commands.
-   Support both interactive (prompt-based) and non-interactive (flag-based) modes.

## 🧱 Proposed Architecture

The CLI will reside in `src/Presentation/CLI/` and will use modern Node.js CLI libraries:
-   **`commander`**: For robust argument parsing and sub-command nesting.
-   **`enquirer`**: For beautiful, interactive prompts.
-   **`chalk`**: For colorized terminal output.

### Command Structure
```bash
ledger [command] [options]

Commands:
  tenant
    - create      # Create a new tenant (interactive or flags)
    - list        # List all tenants
    - set-active  # Set the current tenant context for subsequent commands
  
  account
    - create      # Add a new account to the active tenant
    - list        # List the Chart of Accounts
  
  journal-entry
    - create      # Create a draft entry (interactive wizard)
    - post        # Post a specific draft entry
    - view <id>   # Detailed view of an entry and its lines
```

## 🔐 Configuration & Context
To avoid passing `--tenantId` on every command, the CLI will maintain a local configuration file (e.g., `~/.bak-ledger/config.json`) storing the `activeTenantId`.

## 🛠️ Implementation Phases

### Phase 2.1: Tooling Setup
-   Install `commander`, `enquirer`, and `chalk`.
-   Establish the base command structure in `src/Presentation/CLI/Main.ts`.

### Phase 2.2: Tenant & Account Management
-   Implement `tenant create` and `account list` as the first functional commands.
-   Integrate with the existing Use Cases via the DI Provider.

### Phase 2.3: The Journal Entry Wizard
-   Create a multi-step interactive prompt for adding Journal Entry lines (Debit/Credit).
-   Real-time balance validation (Debit must equal Credit) before calling the Use Case.
