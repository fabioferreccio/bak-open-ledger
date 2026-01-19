import { CsGuid, List } from "dotnet-node-core";
import { IJournalEntryRepository } from "../../../Core/Interfaces/Repositories";
import { JournalEntry } from "../../../Core/Domain/Entities/JournalEntry";
import { PrismaClientInstance } from "../Prisma/PrismaClientInstance";
import { JournalEntryMapper } from "../Mappers/JournalEntryMapper";

export class JournalEntryRepository implements IJournalEntryRepository {
    async GetByIdAsync(id: CsGuid): Promise<JournalEntry | null> {
        const raw = await PrismaClientInstance.Instance.journalEntry.findUnique({
            where: { id: id.ToString() },
            include: { lines: true },
        });

        if (!raw) return null;

        return JournalEntryMapper.toDomain(raw);
    }

    async GetByTenantIdAsync(tenantId: CsGuid): Promise<List<JournalEntry>> {
        const rawList = await PrismaClientInstance.Instance.journalEntry.findMany({
            where: { tenantId: tenantId.ToString() },
            include: { lines: true },
        });

        const list = new List<JournalEntry>();
        for (const raw of rawList) {
            list.Add(JournalEntryMapper.toDomain(raw));
        }
        return list;
    }

    async AddAsync(entry: JournalEntry): Promise<void> {
        const data = JournalEntryMapper.toPersistence(entry);
        await PrismaClientInstance.Instance.journalEntry.create({ data });
    }

    async UpdateAsync(entry: JournalEntry): Promise<void> {
        // Only update Header fields implicitly defined by the Domain logic (Status, PostedAt)
        // We do NOT support updating Lines in this version as per requirements.

        await PrismaClientInstance.Instance.journalEntry.update({
            where: { id: entry.Id.ToString() },
            data: {
                status: JournalEntryMapper.toPersistence(entry).status,
                // If PostedAt was persisted, we would update it here.
                // Since we lack the schema column info for postedAt, we assume Status is the main change.
                updatedAt: new Date(),
            },
        });
    }
}
