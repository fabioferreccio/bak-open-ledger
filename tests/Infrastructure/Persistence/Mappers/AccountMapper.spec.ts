import { AccountMapper } from "../../../../src/Infrastructure/Persistence/Mappers";
import { InvalidOperationException } from "../../../../src/Core/Domain/Exceptions";
import { AccountType } from "../../../../src/Core/Domain/Enums";
import { Account } from "../../../../src/Core/Domain/Entities";
import { CsGuid, CsString } from "dotnet-node-core";

describe("AccountMapper", () => {
    const tenantId = CsGuid.NewGuid();

    it("[ASSET] should map valid Prisma output to Domain Entity", () => {
        const raw = {
            id: CsGuid.NewGuid().ToString(),
            tenantId: tenantId.ToString(),
            code: "1001",
            name: "Cash",
            type: "ASSET",
            parentId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const entity = AccountMapper.toDomain(raw as any); // Type cast for strict enum match simulation

        expect(entity).toBeInstanceOf(Account);
        expect(entity.Id.ToString()).toBe(raw.id);
        expect(entity.Type).toBe(AccountType.Asset);
    });

    it("[LIABILITY] should map valid Prisma output to Domain Entity", () => {
        const raw = {
            id: CsGuid.NewGuid().ToString(),
            tenantId: tenantId.ToString(),
            code: "1001",
            name: "Cash",
            type: "LIABILITY",
            parentId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const entity = AccountMapper.toDomain(raw as any); // Type cast for strict enum match simulation

        expect(entity).toBeInstanceOf(Account);
        expect(entity.Id.ToString()).toBe(raw.id);
        expect(entity.Type).toBe(AccountType.Liability);
    });

    it("[EQUITY] should map valid Prisma output to Domain Entity", () => {
        const raw = {
            id: CsGuid.NewGuid().ToString(),
            tenantId: tenantId.ToString(),
            code: "1001",
            name: "Cash",
            type: "EQUITY",
            parentId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const entity = AccountMapper.toDomain(raw as any); // Type cast for strict enum match simulation

        expect(entity).toBeInstanceOf(Account);
        expect(entity.Id.ToString()).toBe(raw.id);
        expect(entity.Type).toBe(AccountType.Equity);
    });

    it("[REVENUE] should map valid Prisma output to Domain Entity", () => {
        const raw = {
            id: CsGuid.NewGuid().ToString(),
            tenantId: tenantId.ToString(),
            code: "1001",
            name: "Cash",
            type: "REVENUE",
            parentId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const entity = AccountMapper.toDomain(raw as any); // Type cast for strict enum match simulation

        expect(entity).toBeInstanceOf(Account);
        expect(entity.Id.ToString()).toBe(raw.id);
        expect(entity.Type).toBe(AccountType.Revenue);
    });

    it("[EXPENSE] should map valid Prisma output to Domain Entity", () => {
        const raw = {
            id: CsGuid.NewGuid().ToString(),
            tenantId: tenantId.ToString(),
            code: "1001",
            name: "Cash",
            type: "EXPENSE",
            parentId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const entity = AccountMapper.toDomain(raw as any); // Type cast for strict enum match simulation

        expect(entity).toBeInstanceOf(Account);
        expect(entity.Id.ToString()).toBe(raw.id);
        expect(entity.Type).toBe(AccountType.Expense);
    });

    it("[ERROR] should throw InvalidOperationException when mapping invalid Prisma output to Domain Entity", () => {
        const raw = {
            id: CsGuid.NewGuid().ToString(),
            tenantId: tenantId.ToString(),
            code: "1001",
            name: "Cash",
            type: "INVALID",
            parentId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(() => AccountMapper.toDomain(raw as any)).toThrow(InvalidOperationException);
    });

    it("[ERROR] should throw InvalidOperationException when mapping null to Domain", () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(() => AccountMapper.toDomain(null as any)).toThrow(InvalidOperationException);
    });

    it("[ASSET] should map Domain Entity to Persistence input", () => {
        const entity = new Account(
            CsGuid.NewGuid(),
            tenantId,
            CsString.From("1001"),
            CsString.From("Cash"),
            AccountType.Asset,
        );

        const input = AccountMapper.toPersistence(entity);

        expect(input.id).toBe(entity.Id.ToString());
        expect(input.code).toBe("1001");
        expect(input.tenant?.connect?.id).toBe(tenantId.ToString());
        expect(input.parent).toBeUndefined();
    });

    it("[LIABILITY] should map Domain Entity to Persistence input", () => {
        const entity = new Account(
            CsGuid.NewGuid(),
            tenantId,
            CsString.From("1001"),
            CsString.From("Cash"),
            AccountType.Liability,
        );

        const input = AccountMapper.toPersistence(entity);

        expect(input.id).toBe(entity.Id.ToString());
        expect(input.code).toBe("1001");
        expect(input.tenant?.connect?.id).toBe(tenantId.ToString());
        expect(input.parent).toBeUndefined();
    });

    it("[EQUITY] should map Domain Entity to Persistence input", () => {
        const entity = new Account(
            CsGuid.NewGuid(),
            tenantId,
            CsString.From("1001"),
            CsString.From("Cash"),
            AccountType.Equity,
        );

        const input = AccountMapper.toPersistence(entity);

        expect(input.id).toBe(entity.Id.ToString());
        expect(input.code).toBe("1001");
        expect(input.tenant?.connect?.id).toBe(tenantId.ToString());
        expect(input.parent).toBeUndefined();
    });

    it("[REVENUE] should map Domain Entity to Persistence input", () => {
        const entity = new Account(
            CsGuid.NewGuid(),
            tenantId,
            CsString.From("1001"),
            CsString.From("Cash"),
            AccountType.Revenue,
        );

        const input = AccountMapper.toPersistence(entity);

        expect(input.id).toBe(entity.Id.ToString());
        expect(input.code).toBe("1001");
        expect(input.tenant?.connect?.id).toBe(tenantId.ToString());
        expect(input.parent).toBeUndefined();
    });

    it("[EXPENSE] should map Domain Entity to Persistence input", () => {
        const entity = new Account(
            CsGuid.NewGuid(),
            tenantId,
            CsString.From("1001"),
            CsString.From("Cash"),
            AccountType.Expense,
        );

        const input = AccountMapper.toPersistence(entity);

        expect(input.id).toBe(entity.Id.ToString());
        expect(input.code).toBe("1001");
        expect(input.tenant?.connect?.id).toBe(tenantId.ToString());
        expect(input.parent).toBeUndefined();
    });

    it("[ERROR] should throw InvalidOperationException when mapping invalid Domain Entity to Persistence input", () => {
        const entity = new Account(
            CsGuid.NewGuid(),
            tenantId,
            CsString.From("1001"),
            CsString.From("Cash"),
            "Invalid" as AccountType,
        );

        expect(() => AccountMapper.toPersistence(entity)).toThrow(InvalidOperationException);
    });
});

describe("AccountMapper - ParentId Logic", () => {
    const tenantId = CsGuid.NewGuid();

    it("toDomain should map Valid ParentId", () => {
        const parentId = CsGuid.NewGuid();
        const raw = {
            id: CsGuid.NewGuid().ToString(),
            tenantId: tenantId.ToString(),
            code: "1002",
            name: "Bank",
            type: "ASSET",
            parentId: parentId.ToString(), // Present
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const entity = AccountMapper.toDomain(raw as any);

        expect(entity.ParentId).toBeDefined();
        expect(entity.ParentId?.ToString()).toBe(parentId.ToString());
    });

    it("toDomain should map Null ParentId", () => {
        const raw = {
            id: CsGuid.NewGuid().ToString(),
            tenantId: tenantId.ToString(),
            code: "1001",
            name: "Cash",
            type: "ASSET",
            parentId: null, // Null
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const entity = AccountMapper.toDomain(raw as any);

        expect(entity.ParentId).toBeUndefined(); // Domain uses undefined for optional CsGuid usually? Or null? Checks Entity..
        // Account.ts constructor: parentId?: CsGuid. So it is undefined.
    });

    it("toPersistence should map Valid ParentId", () => {
        const parentId = CsGuid.NewGuid();
        const entity = new Account(
            CsGuid.NewGuid(),
            tenantId,
            CsString.From("1002"),
            CsString.From("Bank"),
            AccountType.Asset,
            parentId, // Present
        );

        const input = AccountMapper.toPersistence(entity);

        expect(input.parent).toBeDefined();
        expect(input.parent?.connect?.id).toBe(parentId.ToString());
    });

    it("toPersistence should map Null/Undefined ParentId", () => {
        const entity = new Account(
            CsGuid.NewGuid(),
            tenantId,
            CsString.From("1001"),
            CsString.From("Cash"),
            AccountType.Asset,
            undefined, // Absent
        );

        const input = AccountMapper.toPersistence(entity);

        expect(input.parent).toBeUndefined();
    });
});
