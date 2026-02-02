import { PrismaClient } from "@prisma/client";
import { Injectable } from "dotnet-node-core";

// Prevent multiple instances in development due to hot reloading
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ["query", "error", "warn"],
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export class PrismaClientInstance {
    private static _instance: PrismaClient;

    private constructor() {}

    public static get Instance(): PrismaClient {
        if (!this._instance) {
            this._instance = prisma;
        }
        return this._instance;
    }
}
