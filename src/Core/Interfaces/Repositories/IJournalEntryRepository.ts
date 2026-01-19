import { CsGuid, List } from "dotnet-node-core";
import { JournalEntry } from "../../Domain/Entities";

export interface IJournalEntryRepository {
    GetByIdAsync(id: CsGuid): Promise<JournalEntry | null>;
    GetByTenantIdAsync(tenantId: CsGuid): Promise<List<JournalEntry>>;
    AddAsync(entry: JournalEntry): Promise<void>;
    UpdateAsync(entry: JournalEntry): Promise<void>;
}
