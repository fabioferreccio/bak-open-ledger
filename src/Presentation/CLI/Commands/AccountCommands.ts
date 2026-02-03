import { System } from "dotnet-node-core";
import { IAccountRepository } from "../../../Core/Interfaces/Repositories/IAccountRepository";
import { Account } from "../../../Core/Domain/Entities/Account";
import { AccountType } from "../../../Core/Domain/Enums/AccountType";
import { CliContext } from "../CliContext";

const Command = System.CommandLine.Command;
const AnsiConsole = System.AnsiConsole;

export function GetAccountCommand(provider: any): System.CommandLine.Command {
    let accountCommand = Command.From("account", "Manage accounts");

    // 1. List
    let listCommand = Command.From("list", "List all accounts");
    listCommand = listCommand.SetHandler(async () => {
        const repo = provider.GetService("IAccountRepository") as IAccountRepository;
        const tenantIdStr = await CliContext.GetActiveTenantId();

        if (!tenantIdStr) {
            AnsiConsole.MarkupLine("[red]Error:[/] No active tenant set. Use [yellow]tenant set-active <id>[/]");
            return;
        }

        const tenantId = System.Guid.Parse(tenantIdStr);
        const accounts = await repo.GetByTenantIdAsync(tenantId);
        
        if (accounts.Count === 0) {
            AnsiConsole.MarkupLine("[yellow]No accounts found for this tenant.[/]");
            return;
        }

        const table = new System.Table();
        table.AddColumn("Code");
        table.AddColumn("Name");
        table.AddColumn("Type");
        table.AddColumn("ID");

        const sortedAccounts = accounts.ToArray().sort((a, b) => a.Code.ToString().localeCompare(b.Code.ToString()));

        for(const account of sortedAccounts) {
            table.AddRow(
                account.Code.ToString(), 
                account.Name.ToString(), 
                account.Type.toString(),
                account.Id.ToString()
            );
        }

        AnsiConsole.Write(table);
    });
    accountCommand = accountCommand.AddCommand(listCommand);

    // 2. Create
    let createCommand = Command.From("create", "Create a new account");
    createCommand = createCommand.SetHandler(async () => {
        const repo = provider.GetService("IAccountRepository") as IAccountRepository;
        const tenantIdStr = await CliContext.GetActiveTenantId();

        if (!tenantIdStr) {
            AnsiConsole.MarkupLine("[red]Error:[/] No active tenant set. Use [yellow]tenant set-active <id>[/]");
            return;
        }

        const tenantId = System.Guid.Parse(tenantIdStr);
        
        // Interactive inputs
        const code = await Ask("Account Code (e.g. 1010): ");
        const name = await Ask("Account Name (e.g. Cash): ");
        
        AnsiConsole.MarkupLine("Account Types: 0=Asset, 1=Liability, 2=Equity, 3=Revenue, 4=Expense");
        const typeStr = await Ask("Enter Type ID: ");
        const typeInt = parseInt(typeStr);
        const types = [
            AccountType.Asset,      // 0
            AccountType.Liability,  // 1
            AccountType.Equity,     // 2
            AccountType.Revenue,    // 3
            AccountType.Expense     // 4
        ];

        if (isNaN(typeInt) || typeInt < 0 || typeInt >= types.length) {
            AnsiConsole.MarkupLine("[red]Error:[/] Invalid Account Type ID. Please enter 0-4.");
            return;
        }

        const type = types[typeInt];

        const account = new Account(
            System.Guid.NewGuid(),
            tenantId,
            System.String.From(code),
            System.String.From(name),
            type
        );

        await repo.AddAsync(account);
        AnsiConsole.MarkupLine(`[green]Success:[/] Created account [bold]${name}[/] (Code: ${code})`);
        AnsiConsole.MarkupLine(`[blue]ID:[/] ${account.Id.ToString()}`);
    });
    accountCommand = accountCommand.AddCommand(createCommand);

    return accountCommand;
}

async function Ask(question: string): Promise<string> {
    AnsiConsole.Write(question);
    const line = System.Console.In.ReadLine();
    return line || "";
}
