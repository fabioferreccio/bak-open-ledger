import { DomainException, InvalidOperationException } from "../Exceptions";
import { CsGuid, CsString, List } from "dotnet-node-core";
import { AccountType } from "../Enums";

export class Account {
    public readonly Id: CsGuid;
    public readonly TenantId: CsGuid;
    public readonly ParentId?: CsGuid;
    public readonly Code: CsString;
    public readonly Name: CsString;
    public readonly Type: AccountType;
    public readonly Children: List<Account>;

    constructor(id: CsGuid, tenantId: CsGuid, code: CsString, name: CsString, type: AccountType, parentId?: CsGuid) {
        if (CsString.IsNullOrWhiteSpace(name)) {
            throw new DomainException("Account Name cannot be empty.");
        }
        if (CsString.IsNullOrWhiteSpace(code)) {
            throw new DomainException("Account Code cannot be empty.");
        }

        this.Id = id;
        this.TenantId = tenantId;
        this.Code = code;
        this.Name = name;
        this.Type = type;
        this.ParentId = parentId;
        this.Children = new List<Account>();

        Object.freeze(this);
    }

    public AddChild(account: Account): void {
        // 1. Tenant Safety
        if (!account.TenantId.Equals(this.TenantId)) {
            throw new InvalidOperationException("Cannot add child account from a different tenant.");
        }

        // 2. Structural Integrity
        if (!account.ParentId || !account.ParentId.Equals(this.Id)) {
            throw new InvalidOperationException("Child account must be created with this account as its Parent.");
        }

        // 3. Cycle Prevention (Depth 1)
        if (this.ParentId && this.ParentId.Equals(account.Id)) {
            throw new InvalidOperationException("Cannot add parent account as a child (circular reference).");
        }

        this.Children.Add(account);
    }
}
