/* eslint-disable no-console */
import { configureServices } from "../../Infrastructure/DependencyInjection";
import { IAccountRepository } from "../../Core/Interfaces/Repositories/IAccountRepository";
import { ITenantRepository } from "../../Core/Interfaces/Repositories/ITenantRepository";
import { CreateJournalEntryUseCase } from "../../Core/Application/UseCases/JournalEntries/CreateJournalEntry/CreateJournalEntryUseCase";
import { PostJournalEntryUseCase } from "../../Core/Application/UseCases/JournalEntries/PostJournalEntry/PostJournalEntryUseCase";
import { GetJournalEntryByIdUseCase } from "../../Core/Application/UseCases/JournalEntries/GetJournalEntryById/GetJournalEntryByIdUseCase";
import { Tenant, Account } from "../../Core/Domain/Entities";
import { AccountType } from "../../Core/Domain/Enums";
import { CsGuid, CsString, CsInt32, CsBoolean } from "dotnet-node-core";

async function main() {
    console.log("Starting Financial Ledger CLI Demo...");

    // 1. Initialize DI Container
    const provider = configureServices();

    try {
        console.log("--------------------------------------------------");
        console.log("Step A: Setting up Demo Data (Tenant & Accounts)");

        // Resolve Repositories using String Tokens
        const tenantRepo = provider.GetService<ITenantRepository>("ITenantRepository");
        const accountRepo = provider.GetService<IAccountRepository>("IAccountRepository");

        // Validate Resolution
        if (!tenantRepo) throw new Error("Failed to resolve ITenantRepository");
        if (!accountRepo) throw new Error("Failed to resolve IAccountRepository");

        // Create Tenant
        // Create Tenant
        const timestamp = Date.now().toString().slice(-4);
        const tenantId = CsGuid.NewGuid();
        const tenant = new Tenant(
            tenantId,
            CsString.From(`Acme Corp ${timestamp}`),
            CsString.From(`ACME-${timestamp}`),
            CsInt32.From(12),
            CsString.From("USD"),
            CsBoolean.From(true),
        );
        await tenantRepo.AddAsync(tenant);
        console.log(`Created Tenant: ${tenant.Name} (${tenantId})`);

        // Create Accounts
        const debitAccountId = CsGuid.NewGuid();
        const creditAccountId = CsGuid.NewGuid();

        const debitAccount = new Account(
            debitAccountId,
            tenantId,
            CsString.From("1010"),
            CsString.From("Cash"),
            AccountType.Asset,
        );
        const creditAccount = new Account(
            creditAccountId,
            tenantId,
            CsString.From("4010"),
            CsString.From("Sales Revenue"),
            AccountType.Revenue,
        );

        await accountRepo.AddAsync(debitAccount);
        await accountRepo.AddAsync(creditAccount);
        console.log(`Created Accounts: Cash (${debitAccountId}) & Revenue (${creditAccountId})`);

        console.log("--------------------------------------------------");
        console.log("Step B: Executing Use Cases (Journal Entry Flow)");

        // Resolve Use Cases
        const createUseCase = provider.GetService(CreateJournalEntryUseCase);
        const postUseCase = provider.GetService(PostJournalEntryUseCase);
        const getUseCase = provider.GetService(GetJournalEntryByIdUseCase);

        if (!createUseCase || !postUseCase || !getUseCase) {
            throw new Error("Failed to resolve Use Cases");
        }

        // 1. Create Draft Entry
        const response = await createUseCase.execute({
            tenantId: tenantId.ToString(),
            postingDate: new Date(),
            lines: [
                {
                    accountId: debitAccountId.ToString(),
                    amount: 100.0,
                    direction: "Debit",
                    description: "Cash Sale",
                },
                {
                    accountId: creditAccountId.ToString(),
                    amount: 100.0,
                    direction: "Credit",
                    description: "Revenue Recognition",
                },
            ],
        });
        const entryId = response.id;
        console.log(`[1] Created Journal Entry (Draft): ${entryId}`);

        // 2. Fetch Status
        let entryDto = await getUseCase.execute(entryId);
        console.log(`[2] Fetched Entry Status: ${entryDto?.status}`); // Should be Draft

        // 3. Post Entry
        await postUseCase.execute({ id: entryId });
        console.log(`[3] Posted Journal Entry: ${entryId}`);

        // 4. Fetch Status Again
        entryDto = await getUseCase.execute(entryId);
        console.log(`[4] Fetched New Status: ${entryDto?.status}`); // Should be Posted

        console.log("--------------------------------------------------");
        console.log("Demo Completed Successfully!");
    } catch (error) {
        console.error("CRITICAL FAILURE:");
        console.error(error);
        process.exit(1);
    }
}

main();
