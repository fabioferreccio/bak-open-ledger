import { DomainException } from "./DomainException";

export class InvalidOperationException extends DomainException {
    constructor(message: string, innerException?: Error | unknown) {
        super(message, innerException);
    }
}
