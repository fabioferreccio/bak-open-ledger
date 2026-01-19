import { Account as PrismaAccount, Prisma } from "@prisma/client";
import { Account } from "../../../Core/Domain/Entities/Account";
import { CsGuid, CsString } from "dotnet-node-core";
import { AccountType } from "../../../Core/Domain/Enums";
import { InvalidOperationException } from "../../../Core/Domain/Exceptions";

export class AccountMapper {
    public static toDomain(raw: PrismaAccount): Account {
        if (!raw) {
            throw new InvalidOperationException("Cannot map null Account data to Domain.");
        }

        // Map Prisma UPPERCASE to Domain TitleCase
        let type: AccountType;
        switch (raw.type) {
            case "ASSET":
                type = AccountType.Asset;
                break;
            case "LIABILITY":
                type = AccountType.Liability;
                break;
            case "EQUITY":
                type = AccountType.Equity;
                break;
            case "REVENUE":
                type = AccountType.Revenue;
                break;
            case "EXPENSE":
                type = AccountType.Expense;
                break;
            default:
                throw new InvalidOperationException(`Unknown AccountType: ${raw.type}`);
        }

        return new Account(
            CsGuid.Parse(raw.id),
            CsGuid.Parse(raw.tenantId),
            CsString.From(raw.code),
            CsString.From(raw.name),
            type,
            raw.parentId ? CsGuid.Parse(raw.parentId) : undefined,
        );
    }

    public static toPersistence(entity: Account): Prisma.AccountCreateInput {
        // Map Domain TitleCase to Prisma UPPERCASE
        let type: "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";
        switch (entity.Type) {
            case AccountType.Asset:
                type = "ASSET";
                break;
            case AccountType.Liability:
                type = "LIABILITY";
                break;
            case AccountType.Equity:
                type = "EQUITY";
                break;
            case AccountType.Revenue:
                type = "REVENUE";
                break;
            case AccountType.Expense:
                type = "EXPENSE";
                break;
            default:
                throw new InvalidOperationException(`Unknown AccountType: ${entity.Type}`);
        }

        return {
            id: entity.Id.ToString(),
            tenant: { connect: { id: entity.TenantId.ToString() } },
            code: entity.Code.ToString(),
            name: entity.Name.ToString(),
            type: type,
            parent: entity.ParentId ? { connect: { id: entity.ParentId.ToString() } } : undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }
}
