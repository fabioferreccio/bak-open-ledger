import { CsGuid, CsString, CsInt32, CsBoolean } from "dotnet-node-core";
import { DomainException } from "../Exceptions";

export class Tenant {
    public readonly Id: CsGuid;
    public readonly Name: CsString;
    public readonly Code: CsString;
    public readonly FiscalYearEndMonth: CsInt32;
    public readonly ReportingCurrency: CsString;
    public readonly IsActive: CsBoolean;

    constructor(
        id: CsGuid,
        name: CsString,
        code: CsString,
        fiscalYearEndMonth: CsInt32,
        reportingCurrency: CsString,
        isActive: CsBoolean,
    ) {
        if (CsString.IsNullOrWhiteSpace(name)) {
            throw new DomainException("Tenant Name cannot be empty.");
        }

        if (fiscalYearEndMonth.Value < 1 || fiscalYearEndMonth.Value > 12) {
            throw new DomainException("Fiscal Year End Month must be between 1 and 12.");
        }

        this.Id = id;
        this.Name = name;
        this.Code = code;
        this.FiscalYearEndMonth = fiscalYearEndMonth;
        this.ReportingCurrency = reportingCurrency;
        this.IsActive = isActive;

        Object.freeze(this);
    }
}
