import { CsGuid, CsString, CsBoolean } from "dotnet-node-core";
import { DomainException } from "../Exceptions";

export class CostCenter {
    public readonly Id: CsGuid;
    public readonly TenantId: CsGuid;
    public readonly Code: CsString;
    public readonly Name: CsString;
    public readonly IsActive: CsBoolean;

    constructor(id: CsGuid, tenantId: CsGuid, code: CsString, name: CsString, isActive: CsBoolean) {
        if (CsString.IsNullOrWhiteSpace(code)) {
            throw new DomainException("CostCenter Code cannot be empty.");
        }
        if (CsString.IsNullOrWhiteSpace(name)) {
            throw new DomainException("CostCenter Name cannot be empty.");
        }

        this.Id = id;
        this.TenantId = tenantId;
        this.Code = code;
        this.Name = name;
        this.IsActive = isActive;

        Object.freeze(this);
    }
}
