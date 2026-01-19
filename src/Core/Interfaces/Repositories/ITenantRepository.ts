import { CsGuid } from "dotnet-node-core";
import { Tenant } from "../../Domain/Entities";

export interface ITenantRepository {
    GetByIdAsync(id: CsGuid): Promise<Tenant | null>;
    AddAsync(tenant: Tenant): Promise<void>;
    UpdateAsync(tenant: Tenant): Promise<void>;
}
