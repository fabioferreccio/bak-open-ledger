import { Tenant as PrismaTenant, Prisma } from "@prisma/client";
import { Tenant } from "../../../Core/Domain/Entities/Tenant";
import { CsGuid, CsString, CsInt32, CsBoolean } from "dotnet-node-core";
import { InvalidOperationException } from "../../../Core/Domain/Exceptions";

export class TenantMapper {
    public static toDomain(raw: PrismaTenant): Tenant {
        if (!raw) {
            throw new InvalidOperationException("Cannot map null Tenant data to Domain.");
        }

        return new Tenant(
            CsGuid.Parse(raw.id),
            CsString.From(raw.name),
            CsString.From(raw.slug), // Map slug to Code
            CsInt32.From(raw.fiscalYearEndMonth),
            CsString.From(raw.reportingCurrency),
            CsBoolean.From(raw.isActive),
        );
    }

    public static toPersistence(entity: Tenant): Prisma.TenantCreateInput {
        return {
            id: entity.Id.ToString(),
            name: entity.Name.ToString(),
            slug: entity.Code.ToString(), // Map Code to slug
            fiscalYearEndMonth: entity.FiscalYearEndMonth.Value,
            reportingCurrency: entity.ReportingCurrency.ToString(),
            isActive: entity.IsActive.Value,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }
}
