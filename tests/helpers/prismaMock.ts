import { PrismaClient } from "@prisma/client";
import { mockDeep, DeepMockProxy, mockReset } from "jest-mock-extended";

jest.mock("../../src/Infrastructure/Persistence/Prisma/PrismaClientInstance", () => ({
    PrismaClientInstance: {
        get Instance() {
            return prismaMock;
        },
    },
}));

export const prismaMock = mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
    mockReset(prismaMock);
});
