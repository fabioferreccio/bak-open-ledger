import { JournalEntry as PrismaJournalEntry, JournalEntryLine as PrismaJournalEntryLine, Prisma } from "@prisma/client";
import { JournalEntry, JournalEntryLine } from "../../../Core/Domain/Entities";
import { CsGuid, CsDateTime, CsDecimal, CsString, CsInt32 } from "dotnet-node-core";
import { EntryStatus, EntrySource, DebitCredit } from "../../../Core/Domain/Enums";
import { InvalidOperationException } from "../../../Core/Domain/Exceptions";

export type JournalEntryWithLines = PrismaJournalEntry & { lines: PrismaJournalEntryLine[] };

export class JournalEntryMapper {
    public static toDomain(raw: JournalEntryWithLines): JournalEntry {
        if (!raw) {
            throw new InvalidOperationException("Cannot map null JournalEntry data to Domain.");
        }

        // 1. Create the Aggregate Root (Defaults to Draft)
        const entry = new JournalEntry(
            CsGuid.Parse(raw.id),
            CsGuid.Parse(raw.tenantId),
            CsDateTime.From(raw.postingDate),
        );

        // 2. Hydrate Lines (While technically in Draft state in memory)
        // We must map lines first because adding them to a "Posted" entity via AddLine() would throw.
        // So we add them, THEN we restore the Status.
        if (raw.lines) {
            for (const rawLine of raw.lines) {
                let direction: DebitCredit;
                switch (rawLine.direction) {
                    case "DEBIT":
                        direction = DebitCredit.Debit;
                        break;
                    case "CREDIT":
                        direction = DebitCredit.Credit;
                        break;
                    default:
                        throw new InvalidOperationException(`Unknown DebitCredit: ${rawLine.direction}`);
                }

                // Prisma Decimal to CsDecimal
                // We convert to number for From() if it demands number.
                const amount = CsDecimal.From(Number(rawLine.amount));

                const line = new JournalEntryLine(
                    CsGuid.Parse(rawLine.id),
                    CsGuid.Parse(rawLine.accountId),
                    direction,
                    amount,
                    CsString.From(rawLine.description || ""),
                    rawLine.costCenterId ? CsGuid.Parse(rawLine.costCenterId) : undefined,
                );

                entry.AddLine(line);
            }
        }

        // 3. Restore Aggregate State
        let status: EntryStatus;
        switch (raw.status) {
            case "DRAFT":
                status = EntryStatus.Draft;
                break;
            case "POSTED":
                status = EntryStatus.Posted;
                break;
            case "VOIDED":
                status = EntryStatus.Voided;
                break;
            default:
                throw new InvalidOperationException(`Unknown EntryStatus: ${raw.status}`);
        }

        Object.assign(entry, {
            _status: status,
            // _postedAt: Not available in Schema, leaving undefined or TODO
        });

        return entry;
    }

    public static toPersistence(entity: JournalEntry): Prisma.JournalEntryCreateInput {
        // Map Domain TitleCase to Prisma UPPERCASE
        let status: "DRAFT" | "POSTED" | "VOIDED";
        switch (entity.Status) {
            case EntryStatus.Draft:
                status = "DRAFT";
                break;
            case EntryStatus.Posted:
                status = "POSTED";
                break;
            case EntryStatus.Voided:
                status = "VOIDED";
                break;
            default:
                throw new InvalidOperationException(`Unknown EntryStatus: ${entity.Status}`);
        }

        // Map Lines using Nested Write
        const linesCreate: Prisma.JournalEntryLineCreateWithoutJournalEntryInput[] = [];

        for (const line of entity.Lines) {
            let direction: "DEBIT" | "CREDIT";
            switch (line.Direction) {
                case DebitCredit.Debit:
                    direction = "DEBIT";
                    break;
                case DebitCredit.Credit:
                    direction = "CREDIT";
                    break;
                default:
                    throw new InvalidOperationException(`Unknown DebitCredit: ${line.Direction}`);
            }

            linesCreate.push({
                id: line.Id.ToString(),
                account: { connect: { id: line.AccountId.ToString() } },
                costCenter: line.CostCenterId ? { connect: { id: line.CostCenterId.ToString() } } : undefined,
                direction: direction,
                amount: new Prisma.Decimal(line.Amount.ToString()),
                description: line.Description.ToString(),
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        return {
            id: entity.Id.ToString(),
            tenant: { connect: { id: entity.TenantId.ToString() } },
            // Accessing internal Value of CsDateTime wrapper
            transactionDate: (entity.PostingDate as any).Value || new Date(),
            postingDate: (entity.PostingDate as any).Value || new Date(),
            status: status,
            description: "Journal Entry",
            lines: {
                create: linesCreate,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }
}
