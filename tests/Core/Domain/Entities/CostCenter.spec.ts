import { CostCenter } from "../../../../src/Core/Domain/Entities";
import { CsGuid, CsString, CsBoolean } from "dotnet-node-core";

describe("CostCenter Entity", () => {
    const tenantId = CsGuid.NewGuid();

    // Happy Path
    it("should create a valid CostCenter", () => {
        const cc = new CostCenter(
            CsGuid.NewGuid(),
            tenantId,
            CsString.From("CC01"),
            CsString.From("IT"),
            CsBoolean.From(true),
        );

        expect(cc.Code.ToString()).toBe("CC01");
        expect(cc.IsActive.Value).toBe(true);
    });

    // Invariants
    it("should throw if Code is empty", () => {
        expect(() => {
            new CostCenter(CsGuid.NewGuid(), tenantId, CsString.From(""), CsString.From("IT"), CsBoolean.From(true));
        }).toThrow("CostCenter Code cannot be empty");
    });

    it("should throw if Name is empty", () => {
        expect(() => {
            new CostCenter(CsGuid.NewGuid(), tenantId, CsString.From("CC01"), CsString.From(""), CsBoolean.From(true));
        }).toThrow("CostCenter Name cannot be empty");
    });

    // Tenant Isolation / Type Safety
    it("should store the exact TenantId instance and preserve type", () => {
        // Arrange
        const specificTenantId = CsGuid.NewGuid();
        const cc = new CostCenter(
            CsGuid.NewGuid(),
            specificTenantId,
            CsString.From("CC-SAFE"),
            CsString.From("Type Safety Check"),
            CsBoolean.From(true),
        );

        // Act
        const storedTenantId = cc.TenantId;

        // Assert
        expect(storedTenantId).toBe(specificTenantId); // exact instance check
        expect(storedTenantId).toBeInstanceOf(CsGuid); // type check
    });
});
