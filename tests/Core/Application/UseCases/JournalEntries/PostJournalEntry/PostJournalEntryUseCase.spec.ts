/* eslint-disable @typescript-eslint/no-explicit-any */

import { mockDeep, mockReset } from "jest-mock-extended";
import { IJournalEntryRepository } from "../../../../../../src/Core/Interfaces/Repositories/IJournalEntryRepository";
import { PostJournalEntryUseCase } from "../../../../../../src/Core/Application/UseCases/JournalEntries/PostJournalEntry/PostJournalEntryUseCase";
import { PostJournalEntryRequest } from "../../../../../../src/Core/Application/UseCases/JournalEntries/DTOs";
import { JournalEntry, JournalEntryLine } from "../../../../../../src/Core/Domain/Entities";
import { CsGuid, CsDateTime, CsDecimal, CsString } from "dotnet-node-core";
import { DebitCredit, EntryStatus } from "../../../../../../src/Core/Domain/Enums";
import { InvalidOperationException } from "../../../../../../src/Core/Domain/Exceptions";

describe("PostJournalEntryUseCase", () => {
    const mockRepo = mockDeep<IJournalEntryRepository>();
    const useCase = new PostJournalEntryUseCase(mockRepo);

    beforeEach(() => {
        mockReset(mockRepo);
    });

    it("should successfully post a balanced draft entry", async () => {
        // Arrange
        const id = CsGuid.NewGuid();
        const tenantId = CsGuid.NewGuid();
        const entry = new JournalEntry(id, tenantId, CsDateTime.Now);

        // Balanced Lines
        entry.AddLine(
            new JournalEntryLine(
                CsGuid.NewGuid(),
                CsGuid.NewGuid(),
                DebitCredit.Debit,
                CsDecimal.From(100),
                CsString.From("Debit"),
            ),
        );
        entry.AddLine(
            new JournalEntryLine(
                CsGuid.NewGuid(),
                CsGuid.NewGuid(),
                DebitCredit.Credit,
                CsDecimal.From(100),
                CsString.From("Credit"),
            ),
        );

        mockRepo.GetByIdAsync.mockResolvedValue(entry);

        const request: PostJournalEntryRequest = { id: id.ToString() };

        // Act
        await useCase.execute(request);

        // Assert
        expect(entry.Status).toBe(EntryStatus.Posted);
        expect(mockRepo.UpdateAsync).toHaveBeenCalledTimes(1);
        expect(mockRepo.UpdateAsync).toHaveBeenCalledWith(entry);
    });

    it("should throw if entry is not found", async () => {
        // Arrange
        mockRepo.GetByIdAsync.mockResolvedValue(null);
        const request: PostJournalEntryRequest = { id: CsGuid.NewGuid().ToString() };

        // Act & Assert
        await expect(useCase.execute(request)).rejects.toThrow(InvalidOperationException);
        await expect(useCase.execute(request)).rejects.toThrow(/not found/);
    });

    it("should throw domain exception if entry is unbalanced", async () => {
        // Arrange
        const id = CsGuid.NewGuid();
        const entry = new JournalEntry(id, CsGuid.NewGuid(), CsDateTime.Now);

        // Unbalanced
        entry.AddLine(
            new JournalEntryLine(
                CsGuid.NewGuid(),
                CsGuid.NewGuid(),
                DebitCredit.Debit,
                CsDecimal.From(100),
                CsString.From("Debit"),
            ),
        );
        // Missing credit side

        mockRepo.GetByIdAsync.mockResolvedValue(entry);
        const request: PostJournalEntryRequest = { id: id.ToString() };

        // Act & Assert
        await expect(useCase.execute(request)).rejects.toThrow(InvalidOperationException);
        await expect(useCase.execute(request)).rejects.toThrow(/not balanced/);

        expect(mockRepo.UpdateAsync).not.toHaveBeenCalled();
    });
});
