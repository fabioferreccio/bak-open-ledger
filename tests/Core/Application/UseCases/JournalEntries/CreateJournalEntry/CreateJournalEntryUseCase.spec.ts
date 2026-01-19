/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    CreateJournalEntryRequest,
    CreateJournalEntryUseCase
} from "../../../../../../src/Core/Application/UseCases/JournalEntries/CreateJournalEntry/CreateJournalEntryUseCase";
import { IJournalEntryRepository } from "../../../../../../src/Core/Interfaces/Repositories/IJournalEntryRepository";
import { mockDeep, mockReset } from "jest-mock-extended";
import { CsGuid, CsDecimal } from "dotnet-node-core";
import { EntryStatus, DebitCredit } from "../../../../../../src/Core/Domain/Enums";
import { JournalEntry } from "../../../../../../src/Core/Domain/Entities";
import { InvalidOperationException } from "../../../../../../src/Core/Domain/Exceptions";

describe("CreateJournalEntryUseCase", () => {
    const mockRepo = mockDeep<IJournalEntryRepository>();
    const useCase = new CreateJournalEntryUseCase(mockRepo);

    beforeEach(() => {
        mockReset(mockRepo);
    });

    it("should create a valid Journal Entry", async () => {
        // Arrange
        const tenantId = CsGuid.NewGuid().ToString();
        const accountId = CsGuid.NewGuid().ToString();
        const request: CreateJournalEntryRequest = {
            tenantId: tenantId,
            postingDate: new Date(),
            lines: [
                {
                    accountId: accountId,
                    amount: 100.0,
                    direction: "Debit",
                    description: "Test Debit",
                },
                {
                    accountId: accountId,
                    amount: 100.0,
                    direction: "Credit",
                    description: "Test Credit",
                },
            ],
        };

        // Act
        const response = await useCase.execute(request);

        // Assert
        expect(response.id).toBeDefined();
        expect(CsGuid.TryParse(response.id)).toBe(true);

        // Verify Repository Call
        expect(mockRepo.AddAsync).toHaveBeenCalledTimes(1);
        const capturedEntry = mockRepo.AddAsync.mock.calls[0][0] as JournalEntry;

        expect(capturedEntry.TenantId.ToString()).toBe(tenantId);
        expect(capturedEntry.Status).toBe(EntryStatus.Draft);
        expect(capturedEntry.Lines.Count).toBe(2);

        const firstLine = capturedEntry.Lines.ToArray()[0];
        expect(firstLine.Amount.Equals(CsDecimal.From(100.0))).toBe(true);
        expect(firstLine.Direction).toBe(DebitCredit.Debit);
        expect(firstLine.Description.ToString()).toBe("Test Debit");
    });

    it("should create a valid Journal Entry with Cost Center", async () => {
        // Arrange
        const tenantId = CsGuid.NewGuid().ToString();
        const accountId = CsGuid.NewGuid().ToString();
        const costCenterId = CsGuid.NewGuid().ToString();
        const request: CreateJournalEntryRequest = {
            tenantId: tenantId,
            postingDate: new Date(),
            lines: [
                {
                    accountId: accountId,
                    amount: 150.0,
                    direction: "Debit",
                    description: "Debit with Cost Center",
                    costCenterId: costCenterId,
                },
            ],
        };

        // Act
        const response = await useCase.execute(request);

        // Assert
        expect(response.id).toBeDefined();
        
        expect(mockRepo.AddAsync).toHaveBeenCalledTimes(1);
        const capturedEntry = mockRepo.AddAsync.mock.calls[0][0] as JournalEntry;
        
        const line = capturedEntry.Lines.ToArray()[0];
        expect(line.CostCenterId).toBeDefined();
        expect(line.CostCenterId!.ToString()).toBe(costCenterId);
    });

    it("should throw if TenantId is invalid", async () => {
        // Arrange
        const request: CreateJournalEntryRequest = {
            tenantId: "invalid-guid",
            postingDate: new Date(),
            lines: [],
        };

        // Act & Assert
        await expect(useCase.execute(request)).rejects.toThrow();
    });

    it("should throw if Line Amount is invalid (Domain Validation)", async () => {
        // Arrange
        const tenantId = CsGuid.NewGuid().ToString();
        const accountId = CsGuid.NewGuid().ToString();
        const request: CreateJournalEntryRequest = {
            tenantId: tenantId,
            postingDate: new Date(),
            lines: [
                {
                    accountId: accountId,
                    amount: -50, // Invalid
                    direction: "Debit",
                    description: "Negative Value",
                },
            ],
        };

        // Act & Assert
        await expect(useCase.execute(request)).rejects.toThrow("Line amount must be greater than zero.");
    });

    it("should throw if Direction IS invalid (Switch Default)", async () => {
        // Arrange
        const tenantId = CsGuid.NewGuid().ToString();
        const accountId = CsGuid.NewGuid().ToString();
        const request: CreateJournalEntryRequest = {
            tenantId: tenantId,
            postingDate: new Date(),
            lines: [
                {
                    accountId: accountId,
                    amount: 100,
                    direction: "Sideways" as any, // Force invalid
                    description: "Invalid Direction",
                },
            ],
        };

        // Act & Assert
        await expect(useCase.execute(request)).rejects.toThrow(InvalidOperationException);
    });
});
