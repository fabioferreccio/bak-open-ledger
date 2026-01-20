/* eslint-disable @typescript-eslint/no-explicit-any */

import { mockDeep, mockReset } from "jest-mock-extended";
import { IJournalEntryRepository } from "../../../../../../src/Core/Interfaces/Repositories/IJournalEntryRepository";
import { GetJournalEntryByIdUseCase } from "../../../../../../src/Core/Application/UseCases/JournalEntries/GetJournalEntryById/GetJournalEntryByIdUseCase";
import { JournalEntry, JournalEntryLine } from "../../../../../../src/Core/Domain/Entities";
import { CsGuid, CsDateTime, CsDecimal, CsString } from "dotnet-node-core";
import { DebitCredit } from "../../../../../../src/Core/Domain/Enums";

describe("GetJournalEntryByIdUseCase", () => {
    const mockRepo = mockDeep<IJournalEntryRepository>();
    const useCase = new GetJournalEntryByIdUseCase(mockRepo);

    beforeEach(() => {
        mockReset(mockRepo);
    });

    it("should return mapped DTO when entry exists", async () => {
        // Arrange
        const id = CsGuid.NewGuid();
        const tenantId = CsGuid.NewGuid();
        const accountId = CsGuid.NewGuid();
        const costCenterId = CsGuid.NewGuid();
        const postingDate = CsDateTime.Now;

        const entry = new JournalEntry(id, tenantId, postingDate);

        const line = new JournalEntryLine(
            CsGuid.NewGuid(),
            accountId,
            DebitCredit.Debit,
            CsDecimal.From(123.45),
            CsString.From("Test Line"),
            costCenterId,
        );
        entry.AddLine(line);

        mockRepo.GetByIdAsync.mockResolvedValue(entry);

        // Act
        const result = await useCase.execute(id.ToString());

        // Assert
        expect(result).not.toBeNull();
        expect(result!.id).toBe(id.ToString());
        expect(result!.status).toBe("Draft");
        expect(result!.postingDate).toEqual(new Date(postingDate.ToString()));
        expect(result!.totalDebits).toBe(123.45);
        expect(result!.lines.length).toBe(1);

        const lineDto = result!.lines[0];
        expect(lineDto.accountId).toBe(accountId.ToString());
        expect(lineDto.costCenterId).toBe(costCenterId.ToString());
        expect(lineDto.direction).toBe("Debit");
        expect(lineDto.description).toBe("Test Line");
        expect(lineDto.amount).toBe(123.45);
    });

    it("should return null when entry does not exist", async () => {
        // Arrange
        mockRepo.GetByIdAsync.mockResolvedValue(null);

        // Act
        const result = await useCase.execute(CsGuid.NewGuid().ToString());

        // Assert
        expect(result).toBeNull();
    });
});
