import { System } from "dotnet-node-core";
import { ITenantRepository } from "../../../Core/Interfaces/Repositories/ITenantRepository";
import { Tenant } from "../../../Core/Domain/Entities/Tenant";
import { CliContext } from "../CliContext";

// Shortcuts
const Command = System.CommandLine.Command;
const Argument = System.CommandLine.Argument;
const AnsiConsole = System.AnsiConsole;

export function GetTenantCommand(provider: any): System.CommandLine.Command {
    let tenantCommand = Command.From("tenant", "Manage tenants");

    // 1. List
    let listCommand = Command.From("list", "List all tenants");
    listCommand = listCommand.SetHandler(async () => {
        const repo = provider.GetService("ITenantRepository") as ITenantRepository;
        if (!repo) {
            AnsiConsole.MarkupLine("[red]Error:[/] Could not resolve ITenantRepository.");
            return;
        }

        const tenants = await repo.GetAllAsync();
        
        if (tenants.Count === 0) {
            AnsiConsole.MarkupLine("[yellow]No tenants found.[/]");
            return;
        }

        const table = new System.Table();
        table.AddColumn({ header: "ID", minWidth: 36, wrap: true });
        table.AddColumn({ header: "Name", minWidth: 15, wrap: true });
        table.AddColumn({ header: "Slug", minWidth: 10, wrap: true });
        table.AddColumn({ header: "Currency", minWidth: 8, wrap: true });
        table.AddColumn({ header: "Fiscal Month End", minWidth: 18, wrap: true });
        table.AddColumn({ header: "Active", minWidth: 6, wrap: true });

        for(const tenant of tenants.ToArray()) {
            table.AddRow(
                tenant.Id.ToString(), 
                tenant.Name.ToString(), 
                tenant.Code.ToString(),
                tenant.ReportingCurrency.ToString(),
                tenant.FiscalYearEndMonth.ToString(),
                tenant.IsActive.Value ? "✓" : "✗"
            );
        }

        AnsiConsole.Write(table);
    });
    tenantCommand = tenantCommand.AddCommand(listCommand);

    // 2. Create
    let createCommand = Command.From("create", "Create a new tenant");
    createCommand = createCommand.SetHandler(async () => {
        const repo = provider.GetService("ITenantRepository") as ITenantRepository;
        if (!repo) {
            AnsiConsole.MarkupLine("[red]Error:[/] Could not resolve ITenantRepository.");
            return;
        }

        AnsiConsole.MarkupLine("[bold]Creating a new Tenant[/]");
        
        // Interactive inputs
        const name = await Ask("Enter Tenant Name: ");
        const slug = await Ask("Enter Tenant Slug: ");
        
        const fiscalYearStr = await Ask("Fiscal Year End Month (1-12) [default: 12]: ");
        const fiscalYearEnd = fiscalYearStr ? parseInt(fiscalYearStr) : 12;

        const currencyInput = await Ask("Reporting Currency [default: USD]: ");
        const currency = currencyInput || "USD";

        const tenant = new Tenant(
            System.Guid.NewGuid(),
            System.String.From(name),
            System.String.From(slug),
            System.Int32.From(fiscalYearEnd),
            System.String.From(currency),
            System.Boolean.From(true)
        );

        await repo.AddAsync(tenant);
        AnsiConsole.MarkupLine(`[green]Success:[/] Created tenant [bold]${name}[/] (${tenant.Id.ToString()})`);
        
        // Auto-set active
        await CliContext.SetActiveTenantId(tenant.Id.ToString());
        AnsiConsole.MarkupLine(`[blue]Info:[/] Active context set to this tenant.`);
    });
    tenantCommand = tenantCommand.AddCommand(createCommand);

    // 3. Set Active
    let setActiveCommand = Command.From("set-active", "Set the active tenant context");
    const idArg = Argument.From("id", "The Tenant ID");
    setActiveCommand = setActiveCommand.AddArgument(idArg);
    
    setActiveCommand = setActiveCommand.SetHandler(async (id: any) => {
        const tenantId = id as string;
        await CliContext.SetActiveTenantId(tenantId);
        AnsiConsole.MarkupLine(`[green]Success:[/] Active tenant set to [bold]${tenantId}[/]`);
    });
    tenantCommand = tenantCommand.AddCommand(setActiveCommand);

    return tenantCommand;
}

async function Ask(question: string): Promise<string> {
    AnsiConsole.Write(question);
    const line = System.Console.In.ReadLine();
    return line || "";
}
