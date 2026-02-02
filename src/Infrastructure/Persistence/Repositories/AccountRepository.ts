import { CsGuid, List, Injectable } from "dotnet-node-core";
import { IAccountRepository } from "../../../Core/Interfaces/Repositories";
import { Account } from "../../../Core/Domain/Entities/Account";
import { PrismaClientInstance } from "../Prisma/PrismaClientInstance";
import { AccountMapper } from "../Mappers/AccountMapper";

@Injectable()
export class AccountRepository implements IAccountRepository {
    async GetByIdAsync(id: CsGuid): Promise<Account | null> {
        const raw = await PrismaClientInstance.Instance.account.findUnique({
            where: { id: id.ToString() },
        });

        if (!raw) return null;
        return AccountMapper.toDomain(raw);
    }

    async GetByTenantIdAsync(tenantId: CsGuid): Promise<List<Account>> {
        const rawList = await PrismaClientInstance.Instance.account.findMany({
            where: { tenantId: tenantId.ToString() },
        });

        const list = new List<Account>();
        for (const raw of rawList) {
            list.Add(AccountMapper.toDomain(raw));
        }
        return list;
    }

    async AddAsync(account: Account): Promise<void> {
        const data = AccountMapper.toPersistence(account);
        await PrismaClientInstance.Instance.account.create({ data });
    }

    async UpdateAsync(account: Account): Promise<void> {
        const data = AccountMapper.toPersistence(account);
        await PrismaClientInstance.Instance.account.update({
            where: { id: account.Id.ToString() },
            data,
        });
    }
}
