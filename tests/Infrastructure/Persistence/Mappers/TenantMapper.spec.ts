import { TenantMapper } from "../../../../src/Infrastructure/Persistence/Mappers/TenantMapper";
import { Tenant } from "../../../../src/Core/Domain/Entities/Tenant";
import { CsGuid, CsString, CsInt32, CsBoolean } from "dotnet-node-core";
import { InvalidOperationException } from "../../../../src/Core/Domain/Exceptions";

describe("TenantMapper", () => {
    it("should map valid Prisma output to Domain Entity", () => {
        const raw = {
            id: CsGuid.NewGuid().ToString(),
            name: "Test Tenant",
            slug: "TEST",
            fiscalYearEndMonth: 12,
            reportingCurrency: "USD",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const entity = TenantMapper.toDomain(raw);

        expect(entity).toBeInstanceOf(Tenant);
        expect(entity.Id.ToString()).toBe(raw.id);
        expect(entity.Name.ToString()).toBe(raw.name);
        expect(entity.Code.ToString()).toBe(raw.slug);
        expect(entity.FiscalYearEndMonth.Value).toBe(12);
    });

    it("should throw InvalidOperationException when mapping null to Domain", () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(() => TenantMapper.toDomain(null as any)).toThrow(InvalidOperationException);
    });

    it("should map Domain Entity to Persistence input", () => {
        const entity = new Tenant(
            CsGuid.NewGuid(),
            CsString.From("Test Tenant"),
            CsString.From("TEST"),
            CsInt32.From(12),
            CsString.From("USD"),
            CsBoolean.From(true),
        );

        const input = TenantMapper.toPersistence(entity);

        expect(input.id).toBe(entity.Id.ToString());
        expect(input.name).toBe("Test Tenant");
        expect(input.slug).toBe("TEST");
        expect(input.fiscalYearEndMonth).toBe(12);
        expect(input.isActive).toBe(true);
    });
});
