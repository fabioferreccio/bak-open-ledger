export interface CreateJournalEntryLineRequest {
    accountId: string;
    amount: number;
    direction: "Debit" | "Credit";
    description: string;
    costCenterId?: string;
}

export interface CreateJournalEntryRequest {
    tenantId: string;
    postingDate: Date;
    lines: CreateJournalEntryLineRequest[];
}

export interface CreateJournalEntryResponse {
    id: string;
}

export interface PostJournalEntryRequest {
    id: string;
}

export interface JournalEntryLineResponse {
    accountId: string;
    costCenterId?: string;
    direction: "Debit" | "Credit";
    amount: number;
    description: string;
}

export interface JournalEntryResponse {
    id: string;
    status: string;
    postingDate: Date;
    totalDebits: number;
    totalCredits: number;
    lines: JournalEntryLineResponse[];
}
