import { InvalidOperationException } from "../../../../src/Core/Domain/Exceptions";
import { AccountType } from "../../../../src/Core/Domain/Enums";
import { Account } from "../../../../src/Core/Domain/Entities";
import { CsGuid, CsString } from "dotnet-node-core";

describe("Account Entity", () => {
    const tenantId = CsGuid.NewGuid();

    // Happy Path: Construction
    it("should create a valid Account", () => {
        const account = new Account(
            CsGuid.NewGuid(),
            tenantId,
            CsString.From("1001"),
            CsString.From("Cash"),
            AccountType.Asset,
        );

        expect(account.Code.ToString()).toBe("1001");
        expect(account.Type).toBe(AccountType.Asset);
    });

    // Invariants: Construction
    it("should throw if Name is empty", () => {
        expect(() => {
            new Account(CsGuid.NewGuid(), tenantId, CsString.From("1001"), CsString.From(""), AccountType.Asset);
        }).toThrow("Account Name cannot be empty");
    });

    it("should throw if Code is empty", () => {
        expect(() => {
            new Account(CsGuid.NewGuid(), tenantId, CsString.From(""), CsString.From("Cash"), AccountType.Asset);
        }).toThrow("Account Code cannot be empty");
    });

    // Test Case 1: Success - Should successfully add a child that respects all rules
    it("should successfully add a valid child account", () => {
        const parentId = CsGuid.NewGuid();
        const parent = new Account(
            parentId,
            tenantId,
            CsString.From("1000"),
            CsString.From("Assets"),
            AccountType.Asset,
        );

        const child = new Account(
            CsGuid.NewGuid(),
            tenantId,
            CsString.From("1001"),
            CsString.From("Cash"),
            AccountType.Asset,
            parentId, // Properly linked
        );

        parent.AddChild(child);

        expect(parent.Children.Count).toBe(1);
    });

    // Test Case 2: Failure - Tenant safety
    it("should throw when adding child from a different tenant", () => {
        const parentId = CsGuid.NewGuid();
        const parent = new Account(
            parentId,
            tenantId,
            CsString.From("1000"),
            CsString.From("Assets"),
            AccountType.Asset,
        );

        const child = new Account(
            CsGuid.NewGuid(),
            CsGuid.NewGuid(), // Different Tenant
            CsString.From("1001"),
            CsString.From("Cash"),
            AccountType.Asset,
            parentId,
        );

        expect(() => parent.AddChild(child)).toThrow(InvalidOperationException);
        expect(() => parent.AddChild(child)).toThrow("different tenant");
    });

    // Test Case 3: Failure - Structure (ParentId mismatch)
    it("should throw when child ParentId does not match this Id", () => {
        const parentId = CsGuid.NewGuid();
        const otherId = CsGuid.NewGuid();
        const parent = new Account(
            parentId,
            tenantId,
            CsString.From("1000"),
            CsString.From("Assets"),
            AccountType.Asset,
        );

        const child = new Account(
            CsGuid.NewGuid(),
            tenantId,
            CsString.From("1001"),
            CsString.From("Cash"),
            AccountType.Asset,
            otherId, // Linked to wrong parent (or undefined)
        );

        expect(() => parent.AddChild(child)).toThrow(InvalidOperationException);
        expect(() => parent.AddChild(child)).toThrow("must be created with this account as its Parent");
    });

    // Test Case 4: Failure - Cycle (Depth 1)
    it("should throw when adding parent as child (circular reference)", () => {
        const idA = CsGuid.NewGuid();
        const idB = CsGuid.NewGuid();

        // Entity A claims B is parent
        const childA = new Account(
            idA,
            tenantId,
            CsString.From("1000"),
            CsString.From("Account A"),
            AccountType.Asset,
            idB, // Parent is B
        );

        // Entity B claims A is parent
        const parentB = new Account(
            idB,
            tenantId,
            CsString.From("1100"),
            CsString.From("Account B"),
            AccountType.Asset,
            idA, // Parent is A
        );

        // Try to add A as child of B
        // B.AddChild(A)
        // 1. Tenant: OK (same tenant)
        // 2. Structure: A.ParentId (B) == B.Id? YES. OK.
        // 3. Cycle: B.ParentId (A) == A.Id? YES. FAIL.
        expect(() => parentB.AddChild(childA)).toThrow(InvalidOperationException);
        expect(() => parentB.AddChild(childA)).toThrow("circular reference");
    });
});
