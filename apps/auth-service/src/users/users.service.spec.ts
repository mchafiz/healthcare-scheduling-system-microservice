import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { PrismaService } from "../prisma/prisma.service";

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

describe("UsersService", () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe("findByEmail", () => {
    it("should return user when found", async () => {
      const user = { id: "1", email: "test@test.com", password: "hashed" };
      mockPrisma.user.findUnique.mockResolvedValue(user);

      const result = await service.findByEmail("test@test.com");

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { email: "test@test.com" } });
      expect(result).toEqual(user);
    });

    it("should return null when user not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail("notfound@test.com");

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create and return a new user", async () => {
      const user = { id: "1", email: "new@test.com", password: "hashed" };
      mockPrisma.user.create.mockResolvedValue(user);

      const result = await service.create("new@test.com", "hashed");

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: { email: "new@test.com", password: "hashed" },
      });
      expect(result).toEqual(user);
    });
  });
});
