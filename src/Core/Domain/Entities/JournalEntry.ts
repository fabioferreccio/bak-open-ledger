import { CsGuid, CsDateTime, CsDecimal, List } from "dotnet-node-core";
import { InvalidOperationException } from "../Exceptions";
import { JournalEntryLine } from "./JournalEntryLine";
import { EntryStatus, DebitCredit } from "../Enums";

export class JournalEntry {
    public readonly Id: CsGuid;
    public readonly TenantId: CsGuid;
    public readonly PostingDate: CsDateTime;
    public readonly Lines: List<JournalEntryLine>;

    private _postedAt?: CsDateTime;
    private _status: EntryStatus;

    public get PostedAt(): CsDateTime | undefined {
        return this._postedAt;
    }

    public get Status(): EntryStatus {
        return this._status;
    }

    constructor(id: CsGuid, tenantId: CsGuid, postingDate: CsDateTime) {
        this.Id = id;
        this.TenantId = tenantId;
        this.PostingDate = postingDate;
        this._status = EntryStatus.Draft;
        this.Lines = new List<JournalEntryLine>();
    }

    public AddLine(line: JournalEntryLine): void {
        if (this._status === EntryStatus.Posted) {
            throw new InvalidOperationException("Cannot add lines to a posted entry.");
        }
        this.Lines.Add(line);
    }

    public Post(): void {
        if (this._status !== EntryStatus.Draft) {
            throw new InvalidOperationException("Entry is not in Draft status.");
        }

        if (this.Lines.Count === 0) {
            throw new InvalidOperationException("Entry must have at least one line.");
        }

        if (!this.TotalDebits.Equals(this.TotalCredits)) {
            throw new InvalidOperationException("Entry is not balanced (Debits != Credits).");
        }

        this._status = EntryStatus.Posted;
        this._postedAt = CsDateTime.Now;
    }

    public get TotalDebits(): CsDecimal {
        let total = CsDecimal.From(0);
        for (const line of this.Lines) {
            if (line.Direction === DebitCredit.Debit) {
                total = total.Add(line.Amount);
            }
        }
        return total;
    }

    public get TotalCredits(): CsDecimal {
        let total = CsDecimal.From(0);
        for (const line of this.Lines) {
            if (line.Direction === DebitCredit.Credit) {
                total = total.Add(line.Amount);
            }
        }
        return total;
    }
}
