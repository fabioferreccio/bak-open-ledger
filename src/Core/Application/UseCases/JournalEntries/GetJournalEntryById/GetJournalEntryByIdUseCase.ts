import { CsGuid, Inject, Injectable } from "dotnet-node-core";
import { IJournalEntryRepository } from "../../../../Interfaces/Repositories/IJournalEntryRepository";
import { IUseCase } from "../../../../Interfaces/UseCases/IUseCase";
import { JournalEntryResponse } from "../DTOs";

@Injectable()
export class GetJournalEntryByIdUseCase implements IUseCase<string, JournalEntryResponse | null> {
    constructor(@Inject("IJournalEntryRepository") private readonly _repository: IJournalEntryRepository) {}

    public async execute(id: string): Promise<JournalEntryResponse | null> {
        const entryId = CsGuid.Parse(id);
        const entry = await this._repository.GetByIdAsync(entryId);

        if (!entry) {
            return null;
        }

        return {
            id: entry.Id.ToString(),
            status: entry.Status.toString(),
            postingDate: new Date(entry.PostingDate.ToString()), // Safe conversion
            totalDebits: Number(entry.TotalDebits.ToString()), // Safe conversion
            totalCredits: Number(entry.TotalCredits.ToString()), // Safe conversion
            lines: entry.Lines.ToArray().map((line) => ({
                accountId: line.AccountId.ToString(),
                costCenterId: line.CostCenterId?.ToString(),
                direction: line.Direction,
                amount: Number(line.Amount.ToString()), // Safe conversion
                description: line.Description.ToString(),
            })),
        };
    }
}
