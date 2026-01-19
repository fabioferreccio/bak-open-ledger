// 1. Import Types/Entities (Safe)
import { CsGuid, CsString } from "dotnet-node-core";
import { Account } from "../../../../src/Core/Domain/Entities/Account";
import { AccountType } from "../../../../src/Core/Domain/Enums";

// 2. Import Mock Setup (Must be before Repository)
import { prismaMock } from "../../../helpers/prismaMock";

// 3. Import Repository (Now Mock should apply)
import { AccountRepository } from "../../../../src/Infrastructure/Persistence/Repositories/AccountRepository";

describe("AccountRepository", () => {
    let repository: AccountRepository;
    const tenantId = CsGuid.NewGuid();

    beforeEach(() => {
        // Force clear mocks
        jest.clearAllMocks();
        repository = new AccountRepository();
    });

    it("GetByIdAsync should return Account when found", async () => {
        const id = CsGuid.NewGuid();
        const raw = {
            id: id.ToString(),
            tenantId: tenantId.ToString(),
            code: "1001",
            name: "Cash",
            type: "ASSET" as const,
            parentId: null,
            isActive: true, // TS fix
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        prismaMock.account.findUnique.mockResolvedValue(raw);

        const result = await repository.GetByIdAsync(id);

        expect(result).toBeInstanceOf(Account);
        expect(result?.Id.ToString()).toBe(id.ToString());
        expect(prismaMock.account.findUnique).toHaveBeenCalledWith({
            where: { id: id.ToString() },
        });
    });

    it("GetByIdAsync should return null when not found", async () => {
        const id = CsGuid.NewGuid();

        prismaMock.account.findUnique.mockResolvedValue(null);

        const result = await repository.GetByIdAsync(id);

        expect(result).toBeNull();
        expect(prismaMock.account.findUnique).toHaveBeenCalledWith({
            where: { id: id.ToString() },
        });
    });

    it("GetByTenantIdAsync should return list of Accounts", async () => {
        const rawList = [
            {
                id: CsGuid.NewGuid().ToString(),
                tenantId: tenantId.ToString(),
                code: "1001",
                name: "Cash",
                type: "ASSET" as const,
                parentId: null,
                isActive: true, // TS fix
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];

        prismaMock.account.findMany.mockResolvedValue(rawList);

        const result = await repository.GetByTenantIdAsync(tenantId);

        expect(result).toBeDefined();
        // Check if List has .Count or .length or .ToArray()
        expect(result.ToArray().length).toBe(1); 
        expect(prismaMock.account.findMany).toHaveBeenCalledWith({
            where: { tenantId: tenantId.ToString() },
        });
    });

    it("AddAsync should create new Account", async () => {
        const entity = new Account(
            CsGuid.NewGuid(),
            tenantId,
            CsString.From("1002"),
            CsString.From("Bank"),
            AccountType.Asset
        );

        await repository.AddAsync(entity);

        expect(prismaMock.account.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                id: entity.Id.ToString(),
                tenant: { connect: { id: tenantId.ToString() } },
                code: "1002",
                type: "ASSET",
            }),
        });
    });

    it("UpdateAsync should update existing Account", async () => {
        const entity = new Account(
            CsGuid.NewGuid(),
            tenantId,
            CsString.From("1002"),
            CsString.From("Bank Updated"),
            AccountType.Asset
        );

        await repository.UpdateAsync(entity);

        expect(prismaMock.account.update).toHaveBeenCalledWith({
            where: { id: entity.Id.ToString() },
            data: expect.objectContaining({
                name: "Bank Updated",
                type: "ASSET",
            }),
        });
    });
});
