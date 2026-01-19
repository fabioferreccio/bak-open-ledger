/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    JournalEntryMapper,
    JournalEntryWithLines,
} from "../../../../src/Infrastructure/Persistence/Mappers/JournalEntryMapper";
import { JournalEntry, JournalEntryLine } from "../../../../src/Core/Domain/Entities";
import { CsGuid, CsDateTime, CsDecimal, CsString } from "dotnet-node-core";
import { EntryStatus, DebitCredit } from "../../../../src/Core/Domain/Enums";
import { InvalidOperationException } from "../../../../src/Core/Domain/Exceptions";

describe("JournalEntryMapper", () => {
    const tenantId = CsGuid.NewGuid();
    const accountId = CsGuid.NewGuid();

    // Mock Object for Prisma Decimal (Duck Typing)
    const mockDecimal = (val: number | string) => ({
        toNumber: () => Number(val),
        toString: () => String(val),
        toFixed: (d: number) => Number(val).toFixed(d),
    });

    // Helper to create a Domain Entity with lines
    const createDomainEntity = (status: EntryStatus = EntryStatus.Draft): JournalEntry => {
        const entry = new JournalEntry(CsGuid.NewGuid(), tenantId, CsDateTime.Now);

        entry.AddLine(
            new JournalEntryLine(
                CsGuid.NewGuid(),
                accountId,
                DebitCredit.Debit,
                CsDecimal.From(100),
                CsString.From("Debit Line"),
            ),
        );

        entry.AddLine(
            new JournalEntryLine(
                CsGuid.NewGuid(),
                accountId,
                DebitCredit.Credit,
                CsDecimal.From(100),
                CsString.From("Credit Line"),
            ),
        );

        if (status === EntryStatus.Posted) {
            entry.Post();
        }

        return entry;
    };

    it("toDomain should map Draft Entry with Lines", () => {
        const id = CsGuid.NewGuid().ToString();
        const raw = {
            id: id,
            tenantId: tenantId.ToString(),
            postingDate: new Date(),
            transactionDate: new Date(),
            status: "DRAFT", // Literal string
            description: "Test Entry",
            createdAt: new Date(),
            updatedAt: new Date(),
            lines: [
                {
                    id: CsGuid.NewGuid().ToString(),
                    journalEntryId: id,
                    accountId: accountId.ToString(),
                    direction: "DEBIT",
                    amount: mockDecimal(100), // Check duck typing
                    description: "Debit Line",
                    costCenterId: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: CsGuid.NewGuid().ToString(),
                    journalEntryId: id,
                    accountId: accountId.ToString(),
                    direction: "CREDIT",
                    amount: mockDecimal(100),
                    description: "Credit Line",
                    costCenterId: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ],
        };

        const entity = JournalEntryMapper.toDomain(raw as unknown as JournalEntryWithLines);

        expect(entity).toBeInstanceOf(JournalEntry);
        expect(entity.Id.ToString()).toBe(raw.id);
        expect(entity.Status).toBe(EntryStatus.Draft);
        expect(entity.Lines.Count).toBe(2);
        expect(entity.TotalDebits.ToString()).toBe("100");
    });

    it("toDomain should map Posted Entry and hydrate Status correctly", () => {
        const id = CsGuid.NewGuid().ToString();
        const raw = {
            id: id,
            tenantId: tenantId.ToString(),
            postingDate: new Date(),
            transactionDate: new Date(),
            status: "POSTED",
            description: "Posted Entry",
            createdAt: new Date(),
            updatedAt: new Date(),
            lines: [
                {
                    id: CsGuid.NewGuid().ToString(),
                    journalEntryId: id,
                    accountId: accountId.ToString(),
                    direction: "DEBIT",
                    amount: mockDecimal(50),
                    description: "Debit",
                    costCenterId: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ],
        };

        const entity = JournalEntryMapper.toDomain(raw as unknown as JournalEntryWithLines);

        expect(entity.Status).toBe(EntryStatus.Posted); // Verify hydration override
        expect(entity.Lines.Count).toBe(1);
    });

    it("toDomain status voided", () => {
        const id = CsGuid.NewGuid().ToString();
        const raw = {
            id: id,
            tenantId: tenantId.ToString(),
            postingDate: new Date(),
            transactionDate: new Date(),
            status: "VOIDED",
            description: "Voided Entry",
            createdAt: new Date(),
            updatedAt: new Date(),
            lines: [
                {
                    id: CsGuid.NewGuid().ToString(),
                    journalEntryId: id,
                    accountId: accountId.ToString(),
                    direction: "DEBIT",
                    amount: mockDecimal(50),
                    description: "Debit",
                    costCenterId: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ],
        };

        const entity = JournalEntryMapper.toDomain(raw as unknown as JournalEntryWithLines);

        expect(entity.Status).toBe(EntryStatus.Voided); // Verify hydration override
        expect(entity.Lines.Count).toBe(1);
    });

    it("toPersistence should map Entity to Nested Create Input", () => {
        const entity = createDomainEntity(EntryStatus.Draft);

        const input = JournalEntryMapper.toPersistence(entity);

        expect(input.id).toBe(entity.Id.ToString());
        expect(input.status).toBe("DRAFT");
        expect(input.lines).toBeDefined();
        expect(input.lines?.create).toBeDefined();
        // Use unknown cast to inspect internal structure without full type matching if necessary
        expect((input.lines?.create as unknown as Array<Record<string, unknown>>).length).toBe(2);

        // precise checks
        const lines = input.lines?.create as unknown as Array<Record<string, unknown>>;
        expect(lines[0].direction).toBe("DEBIT");
        expect(lines[1].direction).toBe("CREDIT");
    });

    it("toPersistence should map Posted Entity status", () => {
        const entity = createDomainEntity(EntryStatus.Posted);

        const input = JournalEntryMapper.toPersistence(entity);

        expect(input.status).toBe("POSTED");
    });

    it("toPersistence should map Voided Entity status", () => {
        const entity = createDomainEntity(EntryStatus.Draft);
        // Force status to Voided since no public transition exists yet
        (entity as any)._status = EntryStatus.Voided;

        const input = JournalEntryMapper.toPersistence(entity);

        expect(input.status).toBe("VOIDED");
    });

    it("toDomain should handle JournalEntry with no lines", () => {
        const id = CsGuid.NewGuid().ToString();
        const raw = {
            id: id,
            tenantId: tenantId.ToString(),
            postingDate: new Date(),
            transactionDate: new Date(),
            status: "DRAFT",
            description: "No Lines Entry",
            createdAt: new Date(),
            updatedAt: new Date(),
            lines: null, // Empty lines
        };

        const entity = JournalEntryMapper.toDomain(raw as unknown as JournalEntryWithLines);

        expect(entity.Lines.Count).toBe(0);
    });

    it("toDomain should handle missing line description (default to empty)", () => {
        const id = CsGuid.NewGuid().ToString();
        const raw = {
            id: id,
            tenantId: tenantId.ToString(),
            postingDate: new Date(),
            transactionDate: new Date(),
            status: "DRAFT",
            description: "Entry",
            createdAt: new Date(),
            updatedAt: new Date(),
            lines: [
                {
                    id: CsGuid.NewGuid().ToString(),
                    journalEntryId: id,
                    accountId: accountId.ToString(),
                    direction: "DEBIT",
                    amount: mockDecimal(100),
                    description: null, // Missing description
                    costCenterId: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ],
        };

        const entity = JournalEntryMapper.toDomain(raw as unknown as JournalEntryWithLines);

        expect(entity.Lines.ToArray()[0].Description.ToString()).toBe("");
    });

    it("toDomain should map CostCenterId", () => {
        const id = CsGuid.NewGuid().ToString();
        const costCenterId = CsGuid.NewGuid();
        const raw = {
            id: id,
            tenantId: tenantId.ToString(),
            postingDate: new Date(),
            transactionDate: new Date(),
            status: "DRAFT",
            description: "Entry with CostCenter",
            createdAt: new Date(),
            updatedAt: new Date(),
            lines: [
                {
                    id: CsGuid.NewGuid().ToString(),
                    journalEntryId: id,
                    accountId: accountId.ToString(),
                    direction: "DEBIT",
                    amount: mockDecimal(100),
                    description: "Debit with CostCenter",
                    costCenterId: costCenterId.ToString(), // Present
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ],
        };

        const entity = JournalEntryMapper.toDomain(raw as unknown as JournalEntryWithLines);

        expect(entity.Lines.ToArray()[0].CostCenterId).toBeDefined();
        expect(entity.Lines.ToArray()[0].CostCenterId!.ToString()).toBe(costCenterId.ToString());
    });

    it("toPersistence should map CostCenterId", () => {
        const entity = new JournalEntry(CsGuid.NewGuid(), tenantId, CsDateTime.Now);
        const costCenterId = CsGuid.NewGuid();

        entity.AddLine(
            new JournalEntryLine(
                CsGuid.NewGuid(),
                accountId,
                DebitCredit.Debit,
                CsDecimal.From(100),
                CsString.From("With CostCenter"),
                costCenterId, // Injected
            ),
        );
        entity.AddLine(
            new JournalEntryLine(
                CsGuid.NewGuid(),
                accountId,
                DebitCredit.Credit,
                CsDecimal.From(100),
                CsString.From("No CostCenter"),
                undefined,
            ),
        );

        const input = JournalEntryMapper.toPersistence(entity);
        const lines = input.lines?.create as unknown as Array<Record<string, any>>;

        expect(lines[0].costCenter).toBeDefined();
        expect(lines[0].costCenter.connect.id).toBe(costCenterId.ToString());
        expect(lines[1].costCenter).toBeUndefined();
    });

    it("should throw on null input", () => {
        expect(() => JournalEntryMapper.toDomain(null as unknown as JournalEntryWithLines)).toThrow(
            InvalidOperationException,
        );
    });

    describe("Sad Paths", () => {
        it("toDomain should throw for Invalid EntryStatus", () => {
            const id = CsGuid.NewGuid().ToString();
            const raw = {
                id: id,
                tenantId: tenantId.ToString(),
                postingDate: new Date(),
                transactionDate: new Date(),
                status: "UNDEFINED_STATUS", // Invalid Enum
                description: "Bad Status",
                createdAt: new Date(),
                updatedAt: new Date(),
                lines: [],
            };

            expect(() => JournalEntryMapper.toDomain(raw as unknown as JournalEntryWithLines)).toThrow(
                InvalidOperationException,
            );
            expect(() => JournalEntryMapper.toDomain(raw as unknown as JournalEntryWithLines)).toThrow(
                "Unknown EntryStatus",
            );
        });

        it("toDomain should throw for Invalid DebitCredit Direction", () => {
            const id = CsGuid.NewGuid().ToString();
            const raw = {
                id: id,
                tenantId: tenantId.ToString(),
                postingDate: new Date(),
                transactionDate: new Date(),
                status: "DRAFT",
                description: "Bad Line",
                createdAt: new Date(),
                updatedAt: new Date(),
                lines: [
                    {
                        id: CsGuid.NewGuid().ToString(),
                        journalEntryId: id,
                        accountId: accountId.ToString(),
                        direction: "SIDEWAYS", // Invalid Enum
                        amount: mockDecimal(100),
                        description: "Bad Direction",
                        costCenterId: null,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                ],
            };

            expect(() => JournalEntryMapper.toDomain(raw as unknown as JournalEntryWithLines)).toThrow(
                InvalidOperationException,
            );
            expect(() => JournalEntryMapper.toDomain(raw as unknown as JournalEntryWithLines)).toThrow(
                "Unknown DebitCredit",
            );
        });

        it("toPersistence should throw for Invalid EntryStatus", () => {
            const entity = createDomainEntity(EntryStatus.Draft);
            (entity as any)._status = 999; // Corrupt status

            expect(() => JournalEntryMapper.toPersistence(entity)).toThrow(InvalidOperationException);
            expect(() => JournalEntryMapper.toPersistence(entity)).toThrow("Unknown EntryStatus");
        });

        it("toPersistence should throw for Invalid DebitCredit Direction", () => {
            const entity = new JournalEntry(CsGuid.NewGuid(), tenantId, CsDateTime.Now);

            const corruptLine = new JournalEntryLine(
                CsGuid.NewGuid(),
                accountId,
                999 as unknown as DebitCredit, // Invalid Enum passed to constructor
                CsDecimal.From(100),
                CsString.From("Corrupt Line"),
            );

            entity.AddLine(corruptLine);

            expect(() => JournalEntryMapper.toPersistence(entity)).toThrow(InvalidOperationException);
            expect(() => JournalEntryMapper.toPersistence(entity)).toThrow("Unknown DebitCredit");
        });
    });
});
