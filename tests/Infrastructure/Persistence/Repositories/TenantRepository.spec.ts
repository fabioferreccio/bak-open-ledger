import { CsGuid, CsString, CsInt32, CsBoolean } from "dotnet-node-core";
import { Tenant } from "../../../../src/Core/Domain/Entities/Tenant";
// Import/Apply Mock BEFORE Repository
import { prismaMock } from "../../../helpers/prismaMock";
import { TenantRepository } from "../../../../src/Infrastructure/Persistence/Repositories/TenantRepository";

describe("TenantRepository", () => {
    let repository: TenantRepository;

    beforeEach(() => {
        // Clear mocks to ensure no interference betweeen tests
        jest.clearAllMocks();
        repository = new TenantRepository();
    });

    it("GetByIdAsync should return Tenant when found", async () => {
        const id = CsGuid.NewGuid();
        const raw = {
            id: id.ToString(),
            name: "Test Tenant",
            slug: "TEST",
            fiscalYearEndMonth: 12,
            reportingCurrency: "USD",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        prismaMock.tenant.findUnique.mockResolvedValue(raw);

        const result = await repository.GetByIdAsync(id);

        expect(result).toBeInstanceOf(Tenant);
        expect(result?.Id.ToString()).toBe(id.ToString());
        expect(prismaMock.tenant.findUnique).toHaveBeenCalledWith({
            where: { id: id.ToString() },
        });
    });

    it("GetByIdAsync should return null when not found", async () => {
        const id = CsGuid.NewGuid();
        prismaMock.tenant.findUnique.mockResolvedValue(null);

        const result = await repository.GetByIdAsync(id);

        expect(result).toBeNull();
    });

    it("AddAsync should create new Tenant", async () => {
        const entity = new Tenant(
            CsGuid.NewGuid(),
            CsString.From("Test Tenant"),
            CsString.From("TEST"),
            CsInt32.From(12),
            CsString.From("USD"),
            CsBoolean.From(true)
        );

        await repository.AddAsync(entity);

        expect(prismaMock.tenant.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                id: entity.Id.ToString(),
                slug: "TEST",
            }),
        });
    });

    it("UpdateAsync should update existing Tenant", async () => {
        const entity = new Tenant(
            CsGuid.NewGuid(),
            CsString.From("Updated Tenant"),
            CsString.From("UPDTEST"),
            CsInt32.From(1),
            CsString.From("EUR"),
            CsBoolean.From(false)
        );

        await repository.UpdateAsync(entity);

        expect(prismaMock.tenant.update).toHaveBeenCalledWith({
            where: { id: entity.Id.ToString() },
            data: expect.objectContaining({
                name: "Updated Tenant",
                slug: "UPDTEST",
                isActive: false,
            }),
        });
    });
});
