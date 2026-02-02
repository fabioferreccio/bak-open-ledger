import { ServiceCollection } from "dotnet-node-core";
import { PrismaClient } from "@prisma/client";
import { JournalEntryRepository } from "./Persistence/Repositories/JournalEntryRepository";
import { CreateJournalEntryUseCase } from "../Core/Application/UseCases/JournalEntries/CreateJournalEntry/CreateJournalEntryUseCase";
import { PostJournalEntryUseCase } from "../Core/Application/UseCases/JournalEntries/PostJournalEntry/PostJournalEntryUseCase";
import { GetJournalEntryByIdUseCase } from "../Core/Application/UseCases/JournalEntries/GetJournalEntryById/GetJournalEntryByIdUseCase";
import { TenantRepository } from "./Persistence/Repositories/TenantRepository";
import { AccountRepository } from "./Persistence/Repositories/AccountRepository";
import { PrismaClientInstance } from "./Persistence/Prisma/PrismaClientInstance";

export function configureServices() {
    const services = new ServiceCollection();

    // Singleton: PrismaClient (Database Connection)
    // We register the factory to return the singleton managed by PrismaClientInstance
    services.AddSingleton(PrismaClient, () => PrismaClientInstance.Instance);

    // Scoped: Repositories (Per-request isolation)
    // Registering implementation against interface string token
    services.AddScoped("ITenantRepository", TenantRepository);
    services.AddScoped("IAccountRepository", AccountRepository);
    services.AddScoped("IJournalEntryRepository", JournalEntryRepository);

    // Transient: Use Cases (Stateless orchestration)
    services.AddTransient(CreateJournalEntryUseCase);
    services.AddTransient(PostJournalEntryUseCase);
    services.AddTransient(GetJournalEntryByIdUseCase);

    return services.BuildServiceProvider();
}
