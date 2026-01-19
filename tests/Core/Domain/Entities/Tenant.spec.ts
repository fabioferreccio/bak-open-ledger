import { CsGuid, CsString, CsInt32, CsBoolean } from "dotnet-node-core";
import { Tenant } from "../../../../src/Core/Domain/Entities";

describe("Tenant Entity", () => {
    // Happy Path
    it("should create a valid Tenant", () => {
        const id = CsGuid.NewGuid();
        const tenant = new Tenant(
            id,
            CsString.From("Test Tenant"),
            CsString.From("CODE123"),
            CsInt32.From(12),
            CsString.From("USD"),
            CsBoolean.From(true),
        );

        expect(tenant.Id.Equals(id)).toBe(true);
        expect(tenant.Name.ToString()).toBe("Test Tenant");
    });

    // Invariant Violations
    it("should throw if Name is empty", () => {
        expect(() => {
            new Tenant(
                CsGuid.NewGuid(),
                CsString.From(""),
                CsString.From("CODE"),
                CsInt32.From(12),
                CsString.From("USD"),
                CsBoolean.From(true),
            );
        }).toThrow("Tenant Name cannot be empty");
    });

    it("should throw if FiscalYearEndMonth is invalid (lower bound)", () => {
        expect(() => {
            new Tenant(
                CsGuid.NewGuid(),
                CsString.From("Name"),
                CsString.From("CODE"),
                CsInt32.From(0),
                CsString.From("USD"),
                CsBoolean.From(true),
            );
        }).toThrow("Fiscal Year End Month must be between 1 and 12");
    });

    it("should throw if FiscalYearEndMonth is invalid (upper bound)", () => {
        expect(() => {
            new Tenant(
                CsGuid.NewGuid(),
                CsString.From("Name"),
                CsString.From("CODE"),
                CsInt32.From(13),
                CsString.From("USD"),
                CsBoolean.From(true),
            );
        }).toThrow("Fiscal Year End Month must be between 1 and 12");
    });
});
