import { Exception } from "dotnet-node-core";

export class DomainException extends Exception {
    constructor(message: string, innerException?: Error | unknown) {
        super(message, innerException);
    }
}
