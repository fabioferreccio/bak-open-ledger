import { ITenantRepository } from "../../../Core/Interfaces/Repositories";
import { Tenant } from "../../../Core/Domain/Entities/Tenant";
import { PrismaClientInstance } from "../Prisma/PrismaClientInstance";
import { TenantMapper } from "../Mappers/TenantMapper";
import { CsGuid, Injectable } from "dotnet-node-core";

@Injectable()
export class TenantRepository implements ITenantRepository {
    async GetByIdAsync(id: CsGuid): Promise<Tenant | null> {
        const raw = await PrismaClientInstance.Instance.tenant.findUnique({
            where: { id: id.ToString() },
        });

        if (!raw) return null;
        return TenantMapper.toDomain(raw);
    }

    async AddAsync(tenant: Tenant): Promise<void> {
        const data = TenantMapper.toPersistence(tenant);
        await PrismaClientInstance.Instance.tenant.create({ data });
    }

    async UpdateAsync(tenant: Tenant): Promise<void> {
        const data = TenantMapper.toPersistence(tenant);
        await PrismaClientInstance.Instance.tenant.update({
            where: { id: tenant.Id.ToString() },
            data,
        });
    }
}