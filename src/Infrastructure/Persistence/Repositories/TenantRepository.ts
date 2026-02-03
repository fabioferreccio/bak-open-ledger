import { ITenantRepository } from "../../../Core/Interfaces/Repositories";
import { Tenant } from "../../../Core/Domain/Entities/Tenant";
import { PrismaClientInstance } from "../Prisma/PrismaClientInstance";
import { TenantMapper } from "../Mappers/TenantMapper";
import { CsGuid, Injectable, List } from "dotnet-node-core";

@Injectable()
export class TenantRepository implements ITenantRepository {
    async GetByIdAsync(id: CsGuid): Promise<Tenant | null> {
        const raw = await PrismaClientInstance.Instance.tenant.findUnique({
            where: { id: id.ToString() },
        });

        if (!raw) return null;
        return TenantMapper.toDomain(raw);
    }

    async GetAllAsync(): Promise<List<Tenant>> {
        const rawList = await PrismaClientInstance.Instance.tenant.findMany({
            orderBy: { name: 'asc' }
        });

        const list = new List<Tenant>();
        for (const raw of rawList) {
            list.Add(TenantMapper.toDomain(raw));
        }
        return list;
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