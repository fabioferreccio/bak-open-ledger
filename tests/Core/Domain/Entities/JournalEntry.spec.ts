import { JournalEntry, JournalEntryLine } from "../../../../src/Core/Domain/Entities";
import { InvalidOperationException } from "../../../../src/Core/Domain/Exceptions";
import { EntryStatus, DebitCredit } from "../../../../src/Core/Domain/Enums";
import { CsGuid, CsDateTime, CsDecimal, CsString } from "dotnet-node-core";

describe("JournalEntry Aggregate", () => {
    const tenantId = CsGuid.NewGuid();
    let entry: JournalEntry;

    beforeEach(() => {
        entry = new JournalEntry(CsGuid.NewGuid(), tenantId, CsDateTime.Now);
    });

    // Test Case 1: Should create a valid Draft entry
    it("should create a valid Draft entry", () => {
        expect(entry.Status).toBe(EntryStatus.Draft);
        expect(entry.Lines.Count).toBe(0);
        expect(entry.PostedAt).toBeUndefined();
    });

    // Test Case 2: Should throw if adding a line with 0 amount
    it("should throw if adding a line with 0 amount", () => {
        expect(() => {
            new JournalEntryLine(
                CsGuid.NewGuid(),
                CsGuid.NewGuid(),
                DebitCredit.Debit,
                CsDecimal.From(0),
                CsString.From("Zero Amount"),
            );
        }).toThrow("Line amount must be greater than zero");
    });

    // Test Case 3: Should throw if Posting an unbalanced entry
    it("should throw if Posting an unbalanced entry", () => {
        const debitLine = new JournalEntryLine(
            CsGuid.NewGuid(),
            CsGuid.NewGuid(),
            DebitCredit.Debit,
            CsDecimal.From(100),
            CsString.From("Debit"),
        );
        entry.AddLine(debitLine);

        expect(() => entry.Post()).toThrow(InvalidOperationException);
        expect(() => entry.Post()).toThrow("Entry is not balanced");
    });

    // Test Case 4: Should successfully Post a balanced entry
    it("should successfully Post a balanced entry", () => {
        const debitLine = new JournalEntryLine(
            CsGuid.NewGuid(),
            CsGuid.NewGuid(),
            DebitCredit.Debit,
            CsDecimal.From(100),
            CsString.From("Debit"),
        );
        const creditLine = new JournalEntryLine(
            CsGuid.NewGuid(),
            CsGuid.NewGuid(),
            DebitCredit.Credit,
            CsDecimal.From(100),
            CsString.From("Credit"),
        );

        entry.AddLine(debitLine);
        entry.AddLine(creditLine);

        entry.Post();

        expect(entry.Status).toBe(EntryStatus.Posted);
        expect(entry.PostedAt).toBeDefined();
        expect(entry.TotalDebits.Equals(CsDecimal.From(100))).toBe(true);
        expect(entry.TotalCredits.Equals(CsDecimal.From(100))).toBe(true);
    });

    // Test Case 5: Should throw if trying to AddLine to a Posted entry
    it("should throw if trying to AddLine to a Posted entry", () => {
        const debitLine = new JournalEntryLine(
            CsGuid.NewGuid(),
            CsGuid.NewGuid(),
            DebitCredit.Debit,
            CsDecimal.From(50),
            CsString.From("Debit"),
        );
        const creditLine = new JournalEntryLine(
            CsGuid.NewGuid(),
            CsGuid.NewGuid(),
            DebitCredit.Credit,
            CsDecimal.From(50),
            CsString.From("Credit"),
        );

        entry.AddLine(debitLine);
        entry.AddLine(creditLine);
        entry.Post();

        const newLine = new JournalEntryLine(
            CsGuid.NewGuid(),
            CsGuid.NewGuid(),
            DebitCredit.Debit,
            CsDecimal.From(10),
            CsString.From("New Line"),
        );

        expect(() => entry.AddLine(newLine)).toThrow(InvalidOperationException);
        expect(() => entry.AddLine(newLine)).toThrow("Cannot add lines to a posted entry");
    });

    it("should throw InvalidOperationException when posting an entry with no lines", () => {
        // Arrange
        const entry = new JournalEntry(CsGuid.NewGuid(), CsGuid.NewGuid(), CsDateTime.Now);

        // Act & Assert
        expect(() => entry.Post()).toThrow(InvalidOperationException);
        expect(() => entry.Post()).toThrow("Entry must have at least one line.");
    });

    it("should throw InvalidOperationException when posting an entry that is already Posted", () => {
        // Arrange
        const entry = new JournalEntry(CsGuid.NewGuid(), CsGuid.NewGuid(), CsDateTime.Now);

        // Adiciona linhas balanceadas para conseguir postar a primeira vez
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

        // Posta a primeira vez (sucesso)
        entry.Post();

        // Act & Assert - Tenta postar de novo
        expect(() => entry.Post()).toThrow(InvalidOperationException);
        expect(() => entry.Post()).toThrow("Entry is not in Draft status.");
    });
});
