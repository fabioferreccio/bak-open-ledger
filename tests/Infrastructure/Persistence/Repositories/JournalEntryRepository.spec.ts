/* eslint-disable @typescript-eslint/no-explicit-any */
// 1. Imports
import { CsGuid, CsDateTime, CsDecimal, CsString } from "dotnet-node-core";
import { JournalEntry, JournalEntryLine } from "../../../../src/Core/Domain/Entities";
import { DebitCredit } from "../../../../src/Core/Domain/Enums";
import { prismaMock } from "../../../helpers/prismaMock";
import { JournalEntryRepository } from "../../../../src/Infrastructure/Persistence/Repositories/JournalEntryRepository";
import { Prisma, JournalEntry as PJournalEntry, JournalEntryLine as PLine } from "@prisma/client";

describe("JournalEntryRepository", () => {
    let repository: JournalEntryRepository;
    const tenantId = CsGuid.NewGuid();

    beforeEach(() => {
        jest.clearAllMocks();
        repository = new JournalEntryRepository();
    });

    const createDomainEntity = (): JournalEntry => {
        const entry = new JournalEntry(CsGuid.NewGuid(), tenantId, CsDateTime.Now);
        entry.AddLine(
            new JournalEntryLine(
                CsGuid.NewGuid(),
                CsGuid.NewGuid(),
                DebitCredit.Debit,
                CsDecimal.From(100),
                CsString.From("Deb"),
            ),
        );
        entry.AddLine(
            new JournalEntryLine(
                CsGuid.NewGuid(),
                CsGuid.NewGuid(),
                DebitCredit.Credit,
                CsDecimal.From(100),
                CsString.From("Cre"),
            ),
        );
        return entry;
    };

    it("AddAsync should Perform atomic Nested Create", async () => {
        const entity = createDomainEntity();

        await repository.AddAsync(entity);

        expect(prismaMock.journalEntry.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    id: entity.Id.ToString(),
                    status: "DRAFT",
                    lines: expect.objectContaining({
                        create: expect.any(Array),
                    }),
                }),
            }),
        );

        // Verify line count in the mock call
        const callArgs = prismaMock.journalEntry.create.mock.calls[0][0];
        const lines = callArgs.data.lines?.create as unknown as Array<Record<string, unknown>>;
        expect(lines).toHaveLength(2);
    });

    it("GetByIdAsync should Include Lines", async () => {
        const id = CsGuid.NewGuid();
        const raw = {
            id: id.ToString(),
            tenantId: tenantId.ToString(),
            status: "DRAFT",
            postingDate: new Date(),
            transactionDate: new Date(),
            description: "Test",
            createdAt: new Date(),
            updatedAt: new Date(),
            lines: [
                {
                    id: CsGuid.NewGuid().ToString(),
                    journalEntryId: id.ToString(),
                    accountId: CsGuid.NewGuid().ToString(),
                    direction: "DEBIT",
                    amount: new Prisma.Decimal(100),
                    description: "D",
                    costCenterId: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ],
        };

        // Mock return
        prismaMock.journalEntry.findUnique.mockResolvedValue(raw as unknown as PJournalEntry & { lines: PLine[] });

        const result = await repository.GetByIdAsync(id);

        expect(result).toBeInstanceOf(JournalEntry);
        expect(result?.Lines.Count).toBe(1);
        expect(prismaMock.journalEntry.findUnique).toHaveBeenCalledWith({
            where: { id: id.ToString() },
            include: { lines: true },
        });
    });

    it("UpdateAsync should only update Header Status/Date", async () => {
        const entity = createDomainEntity();
        entity.Post(); // Status becomes Posted

        await repository.UpdateAsync(entity);

        expect(prismaMock.journalEntry.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: entity.Id.ToString() },
                data: expect.objectContaining({
                    status: "POSTED",
                }),
            }),
        );

        // Ensure lines are NOT updated
        const callArgs = prismaMock.journalEntry.update.mock.calls[0][0];
        expect(callArgs.data).not.toHaveProperty("lines");
    });

    it("GetByTenantIdAsync should returns List of Entries with Lines", async () => {
        const id = CsGuid.NewGuid();
        const raw = {
            id: id.ToString(),
            tenantId: tenantId.ToString(),
            status: "DRAFT",
            postingDate: new Date(),
            transactionDate: new Date(),
            description: "Tenant Test",
            createdAt: new Date(),
            updatedAt: new Date(),
            lines: [],
        };

        // Mock return array
        prismaMock.journalEntry.findMany.mockResolvedValue([raw] as unknown as (PJournalEntry & { lines: PLine[] })[]);

        const result = await repository.GetByTenantIdAsync(tenantId);

        expect(result.ToArray().length).toBe(1); // List<T> usage
        expect(result.ToArray()[0].Id.ToString()).toBe(id.ToString());
        expect(prismaMock.journalEntry.findMany).toHaveBeenCalledWith({
            where: { tenantId: tenantId.ToString() },
            include: { lines: true },
        });
    });

    it("GetByIdAsync should return null when not found", async () => {
        const id = CsGuid.NewGuid();

        prismaMock.journalEntry.findUnique.mockResolvedValue(null);

        const result = await repository.GetByIdAsync(id);

        expect(result).toBeNull();
        expect(prismaMock.journalEntry.findUnique).toHaveBeenCalledWith({
            where: { id: id.ToString() },
            include: { lines: true },
        });
    });
});
