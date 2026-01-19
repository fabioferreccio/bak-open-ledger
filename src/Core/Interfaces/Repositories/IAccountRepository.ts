import { CsGuid, List } from "dotnet-node-core";
import { Account } from "../../Domain/Entities";

export interface IAccountRepository {
    GetByIdAsync(id: CsGuid): Promise<Account | null>;
    GetByTenantIdAsync(tenantId: CsGuid): Promise<List<Account>>;
    AddAsync(account: Account): Promise<void>;
    UpdateAsync(account: Account): Promise<void>;
}
