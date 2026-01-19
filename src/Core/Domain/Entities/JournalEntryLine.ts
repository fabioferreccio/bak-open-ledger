import { CsGuid, CsDecimal, CsString } from "dotnet-node-core";
import { DomainException } from "../Exceptions";
import { DebitCredit } from "../Enums";

export class JournalEntryLine {
    public readonly Id: CsGuid;
    public readonly AccountId: CsGuid;
    public readonly CostCenterId?: CsGuid;
    public readonly Direction: DebitCredit;
    public readonly Amount: CsDecimal;
    public readonly Description: CsString;

    constructor(
        id: CsGuid,
        accountId: CsGuid,
        direction: DebitCredit,
        amount: CsDecimal,
        description: CsString,
        costCenterId?: CsGuid,
    ) {
        if (amount.CompareTo(CsDecimal.From(0)) <= 0) {
            throw new DomainException("Line amount must be greater than zero.");
        }

        this.Id = id;
        this.AccountId = accountId;
        this.Direction = direction;
        this.Amount = amount;
        this.Description = description;
        this.CostCenterId = costCenterId;

        Object.freeze(this);
    }
}
