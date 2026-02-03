import { System } from "dotnet-node-core";
import { join } from "path";
import { homedir } from "os";

export class CliContext {
    private static readonly ConfigDir = join(homedir(), ".bak-ledger");
    private static readonly ConfigFile = join(homedir(), ".bak-ledger", "config.json");

    public static async GetActiveTenantId(): Promise<string | null> {
        try {
            if (!System.IO.File.Exists(this.ConfigFile)) {
                return null;
            }

            const json = System.IO.File.ReadAllText(this.ConfigFile);
            const config = JSON.parse(json);
            return config.activeTenantId || null;
        } catch {
            return null;
        }
    }

    public static async SetActiveTenantId(tenantId: string): Promise<void> {
        if (!System.IO.Directory.Exists(this.ConfigDir)) {
            System.IO.Directory.CreateDirectory(this.ConfigDir);
        }

        const config = { activeTenantId: tenantId };
        System.IO.File.WriteAllText(this.ConfigFile, JSON.stringify(config, null, 2));
    }
}
