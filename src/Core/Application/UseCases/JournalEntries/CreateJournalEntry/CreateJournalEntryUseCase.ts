import { IUseCase } from "../../../../Interfaces/UseCases/IUseCase";
import { IJournalEntryRepository } from "../../../../Interfaces/Repositories/IJournalEntryRepository";
import { JournalEntry, JournalEntryLine } from "../../../../Domain/Entities";
import { CsGuid, CsDateTime, CsDecimal, CsString } from "dotnet-node-core";
import { DebitCredit } from "../../../../Domain/Enums";
import { InvalidOperationException } from "../../../../Domain/Exceptions";

import { CreateJournalEntryRequest, CreateJournalEntryResponse } from "../DTOs";

export class CreateJournalEntryUseCase implements IUseCase<CreateJournalEntryRequest, CreateJournalEntryResponse> {
    constructor(private readonly _journalEntryRepository: IJournalEntryRepository) {}

    public async execute(request: CreateJournalEntryRequest): Promise<CreateJournalEntryResponse> {
        // 1. Convert DTO primitives to Domain Value Objects
        const tenantId = CsGuid.Parse(request.tenantId);
        const postingDate = CsDateTime.From(request.postingDate);
        const entryId = CsGuid.NewGuid();

        // 2. Create Aggregate Root
        const entry = new JournalEntry(entryId, tenantId, postingDate);

        // 3. Process Lines
        for (const lineReq of request.lines) {
            let direction: DebitCredit;

            switch (lineReq.direction) {
                case "Debit":
                    direction = DebitCredit.Debit;
                    break;
                case "Credit":
                    direction = DebitCredit.Credit;
                    break;
                default:
                    throw new InvalidOperationException(`Invalid direction: ${lineReq.direction}`);
            }

            const line = new JournalEntryLine(
                CsGuid.NewGuid(),
                CsGuid.Parse(lineReq.accountId),
                direction,
                CsDecimal.From(lineReq.amount),
                CsString.From(lineReq.description),
                lineReq.costCenterId ? CsGuid.Parse(lineReq.costCenterId) : undefined,
            );

            entry.AddLine(line);
        }

        // 4. Persist
        await this._journalEntryRepository.AddAsync(entry);

        // 5. Return Response
        return {
            id: entry.Id.ToString(),
        };
    }
}
