import { Test, TestingModule } from "@nestjs/testing";
import { CustomerService } from "./customer.service";
import { PrismaService } from "../prisma/prisma.service";
import { CacheService } from "../cache/cache.service";
import { NotFoundException, ConflictException } from "@nestjs/common";

const mockPrisma = {
  customer: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

const mockCache = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  delByPattern: jest.fn(),
};

const mockCustomer = {
  id: "c1",
  name: "John",
  email: "john@test.com",
  phone: "08123",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("CustomerService", () => {
  let service: CustomerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CacheService, useValue: mockCache },
      ],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
    jest.clearAllMocks();
    mockCache.get.mockResolvedValue(null);
    mockCache.set.mockResolvedValue(undefined);
    mockCache.del.mockResolvedValue(undefined);
    mockCache.delByPattern.mockResolvedValue(undefined);
  });

  describe("findAll", () => {
    it("should return paginated customers from DB on cache miss", async () => {
      mockPrisma.customer.findMany.mockResolvedValue([mockCustomer]);
      mockPrisma.customer.count.mockResolvedValue(1);

      const result = await service.findAll();

      expect(result).toEqual({ data: [mockCustomer], total: 1 });
      expect(mockPrisma.customer.findMany).toHaveBeenCalledWith({ skip: 0, take: 10 });
      expect(mockCache.set).toHaveBeenCalled();
    });

    it("should return cached result on cache hit", async () => {
      const cached = { data: [mockCustomer], total: 1 };
      mockCache.get.mockResolvedValue(cached);

      const result = await service.findAll();

      expect(result).toEqual(cached);
      expect(mockPrisma.customer.findMany).not.toHaveBeenCalled();
    });

    it("should pass custom skip and take", async () => {
      mockPrisma.customer.findMany.mockResolvedValue([mockCustomer]);
      mockPrisma.customer.count.mockResolvedValue(5);

      const result = await service.findAll(2, 5);

      expect(result).toEqual({ data: [mockCustomer], total: 5 });
      expect(mockPrisma.customer.findMany).toHaveBeenCalledWith({ skip: 2, take: 5 });
    });
  });

  describe("findOne", () => {
    it("should return a customer from DB on cache miss", async () => {
      mockPrisma.customer.findUnique.mockResolvedValue(mockCustomer);

      const result = await service.findOne("c1");

      expect(result).toEqual(mockCustomer);
      expect(mockCache.set).toHaveBeenCalled();
    });

    it("should return cached customer on cache hit", async () => {
      mockCache.get.mockResolvedValue(mockCustomer);

      const result = await service.findOne("c1");

      expect(result).toEqual(mockCustomer);
      expect(mockPrisma.customer.findUnique).not.toHaveBeenCalled();
    });

    it("should throw NotFoundException if customer not found", async () => {
      mockPrisma.customer.findUnique.mockResolvedValue(null);

      await expect(service.findOne("none")).rejects.toThrow(NotFoundException);
    });
  });

  describe("create", () => {
    it("should create a new customer and invalidate cache", async () => {
      mockPrisma.customer.findFirst.mockResolvedValue(null);
      mockPrisma.customer.create.mockResolvedValue(mockCustomer);

      const result = await service.create({ name: "John", email: "john@test.com", phone: "08123" });

      expect(result).toEqual(mockCustomer);
      expect(mockCache.delByPattern).toHaveBeenCalledWith("customers:*");
    });

    it("should throw ConflictException if email already exists", async () => {
      mockPrisma.customer.findFirst.mockResolvedValue(mockCustomer);

      await expect(
        service.create({ name: "John", email: "john@test.com", phone: "08123" }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("update", () => {
    it("should update and invalidate cache", async () => {
      const updated = { ...mockCustomer, name: "Jane" };
      mockPrisma.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrisma.customer.update.mockResolvedValue(updated);

      const result = await service.update("c1", { name: "Jane" });

      expect(result.name).toBe("Jane");
      expect(mockCache.delByPattern).toHaveBeenCalledWith("customers:*");
    });

    it("should throw NotFoundException if customer not found", async () => {
      mockPrisma.customer.findUnique.mockResolvedValue(null);

      await expect(service.update("none", { name: "Jane" })).rejects.toThrow(NotFoundException);
    });
  });

  describe("delete", () => {
    it("should delete and invalidate cache", async () => {
      mockPrisma.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrisma.customer.delete.mockResolvedValue(mockCustomer);

      const result = await service.delete("c1");

      expect(result).toBe(true);
      expect(mockCache.delByPattern).toHaveBeenCalledWith("customers:*");
    });

    it("should throw NotFoundException if customer not found", async () => {
      mockPrisma.customer.findUnique.mockResolvedValue(null);

      await expect(service.delete("none")).rejects.toThrow(NotFoundException);
    });
  });
});
