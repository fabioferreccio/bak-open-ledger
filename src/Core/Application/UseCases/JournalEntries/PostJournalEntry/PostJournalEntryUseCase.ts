import { CsGuid } from "dotnet-node-core";

import { InvalidOperationException } from "../../../../Domain/Exceptions";
import { IJournalEntryRepository } from "../../../../Interfaces/Repositories/IJournalEntryRepository";
import { IUseCase } from "../../../../Interfaces/UseCases/IUseCase";
import { PostJournalEntryRequest } from "../DTOs";

export class PostJournalEntryUseCase implements IUseCase<PostJournalEntryRequest, void> {
    constructor(private readonly _repository: IJournalEntryRepository) {}

    public async execute(request: PostJournalEntryRequest): Promise<void> {
        const id = CsGuid.Parse(request.id);
        const entry = await this._repository.GetByIdAsync(id);

        if (!entry) {
            throw new InvalidOperationException(`Journal Entry with ID ${request.id} not found.`);
        }

        entry.Post();

        await this._repository.UpdateAsync(entry);
    }
}
