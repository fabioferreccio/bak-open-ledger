/* eslint-disable no-console */
import { System } from "dotnet-node-core";
import { configureServices } from "../../Infrastructure/DependencyInjection";
import { GetTenantCommand } from "./Commands/TenantCommands";
import { GetAccountCommand } from "./Commands/AccountCommands";
import { GetJournalEntryCommand } from "./Commands/JournalEntryCommands";

async function main() {
    // 1. Initialize DI
    const provider = configureServices();

    // 2. Build Root Command
    let root = new System.CommandLine.RootCommand("BAK Open Ledger CLI") as System.CommandLine.Command;

    // 3. Register Subcommands
    root = root.AddCommand(GetTenantCommand(provider));
    root = root.AddCommand(GetAccountCommand(provider));
    root = root.AddCommand(GetJournalEntryCommand(provider));

    // 4. Parse & Invoke
    const args = process.argv.slice(2);
    
    // Cast back to RootCommand (runtime structure allows this)
    const parser = new System.CommandLine.Parser(root as System.CommandLine.RootCommand);
    const result = parser.Parse(args);

    // Helper to display help
    const showHelp = (cmd?: System.CommandLine.Command) => {
        const helpBuilder = new System.CommandLine.HelpBuilder(System.AnsiConsole.Console);
        helpBuilder.Write(cmd || root);
    };

    // 5. Handle Help Request (Explicit or Empty)
    const isHelp = args.includes("--help") || args.includes("-h") || args.includes("-?") || args.length === 0;
    if (isHelp) {
        showHelp(result.Command);
        return;
    }

    // 6. Handle Errors
    if (result.Errors.Count > 0) {
        for(const error of result.Errors) {
            System.AnsiConsole.MarkupLine(`[red]Error:[/] ${error.ToString()}`);
        }
        process.exit(1);
    }

    // 7. Invocation
    const command = result.Command;
    if (command && command.Handler) {
        const bindingContext = System.CommandLine.BindingContext.From(result);
        const invocationContext = new System.CommandLine.InvocationContext(bindingContext, command, provider);
        await command.Handler(invocationContext);
    } else {
        // Valid command but no handler (e.g. wrapper command)
        showHelp(command);
    }
}

main().catch(err => {
    System.AnsiConsole.MarkupLine(`[red]Critical Error:[/] ${err.message}`);
    process.exit(1);
});
