import { CsGuid, List } from "dotnet-node-core";
import { CostCenter } from "../../Domain/Entities";

export interface ICostCenterRepository {
    GetByIdAsync(id: CsGuid): Promise<CostCenter | null>;
    GetByTenantIdAsync(tenantId: CsGuid): Promise<List<CostCenter>>;
    AddAsync(costCenter: CostCenter): Promise<void>;
    UpdateAsync(costCenter: CostCenter): Promise<void>;
}
