import { System } from "dotnet-node-core";
import { CreateJournalEntryUseCase } from "../../../Core/Application/UseCases/JournalEntries/CreateJournalEntry/CreateJournalEntryUseCase";
import { PostJournalEntryUseCase } from "../../../Core/Application/UseCases/JournalEntries/PostJournalEntry/PostJournalEntryUseCase";
import { CliContext } from "../CliContext";
import { CreateJournalEntryRequest, CreateJournalEntryLineRequest } from "../../../Core/Application/UseCases/JournalEntries/DTOs";

const Command = System.CommandLine.Command;
const Argument = System.CommandLine.Argument;
const AnsiConsole = System.AnsiConsole;

export function GetJournalEntryCommand(provider: any): System.CommandLine.Command {
    let journalCommand = Command.From("journal-entry", "Manage journal entries");

    // 1. Create (Wizard)
    let createCommand = Command.From("create", "Create a new draft journal entry");
    createCommand = createCommand.SetHandler(async () => {
        const createUseCase = provider.GetService(CreateJournalEntryUseCase) as CreateJournalEntryUseCase;
        const tenantIdStr = await CliContext.GetActiveTenantId();

        if (!tenantIdStr) {
            AnsiConsole.MarkupLine("[red]Error:[/] No active tenant set.");
            return;
        }

        AnsiConsole.MarkupLine("[bold]New Journal Entry[/]");
        // Description is not supported by UseCase DTO currently
        // const description = await Ask("Description: ");
        // const ref = await Ask("Reference (optional): ");

        const lines: CreateJournalEntryLineRequest[] = [];
        let addingLines = true;

        while (addingLines) {
            AnsiConsole.MarkupLine(`\n[underline]Line Item #${lines.length + 1}[/]`);
            const accountId = await Ask("Account ID: ");
            const amountStr = await Ask("Amount: ");
            const amount = parseFloat(amountStr);
            const direction = await Ask("Direction (Debit/Credit): ");
            // Description is not supported by UseCase DTO currently
            // const lineDesc = await Ask("Line Description: "); 
            const lineDesc = "Manual Entry"; // Hardcoded or omitted

            lines.push({
                accountId,
                amount,
                direction: direction as "Debit" | "Credit", // Simple cast
                description: lineDesc,
                // costCenterId: ... (optional)
            });

            const more = await Ask("Add another line? (y/n): ");
            if (more.toLowerCase() !== 'y') addingLines = false;
        }

        const request: CreateJournalEntryRequest = {
            tenantId: tenantIdStr,
            postingDate: new Date(),
            // description: description, // Not supported by DTO/Entity
            // reference: ref,           // Not supported by DTO/Entity
            lines: lines
        };

        try {
            const result = await createUseCase.execute(request);
            AnsiConsole.MarkupLine(`[green]Success:[/] Created Draft Entry ID: [bold]${result.id}[/]`);
            AnsiConsole.MarkupLine("Use 'post <id>' to finalize it.");
        } catch (e: any) {
            AnsiConsole.MarkupLine(`[red]Error:[/] ${e.message}`);
        }
    });
    journalCommand = journalCommand.AddCommand(createCommand);

    // 2. Post
    let postCommand = Command.From("post", "Post a draft entry");
    postCommand = postCommand.AddArgument(Argument.From("id", "Journal Entry ID"));
    postCommand = postCommand.SetHandler(async (id: any) => {
        const postUseCase = provider.GetService(PostJournalEntryUseCase) as PostJournalEntryUseCase;
        try {
            await postUseCase.execute({ id: id });
            AnsiConsole.MarkupLine(`[green]Success:[/] Journal Entry [bold]${id}[/] has been POSTED.`);
        } catch (e: any) {
            AnsiConsole.MarkupLine(`[red]Error:[/] ${e.message}`);
        }
    });
    journalCommand = journalCommand.AddCommand(postCommand);

    return journalCommand;
}

async function Ask(question: string): Promise<string> {
    AnsiConsole.Write(question);
    const line = System.Console.In.ReadLine();
    return line || "";
}
