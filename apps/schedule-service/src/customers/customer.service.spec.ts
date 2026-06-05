import { Test, TestingModule } from "@nestjs/testing";
import { CustomerService } from "./customer.service";
import { PrismaService } from "../prisma/prisma.service";
import { NotFoundException, ConflictException } from "@nestjs/common";

const mockPrisma = {
  customer: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
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
      ],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("should return all customers", async () => {
      mockPrisma.customer.findMany.mockResolvedValue([mockCustomer]);

      const result = await service.findAll();

      expect(result).toEqual([mockCustomer]);
    });
  });

  describe("findOne", () => {
    it("should return a customer by id", async () => {
      mockPrisma.customer.findUnique.mockResolvedValue(mockCustomer);

      const result = await service.findOne("c1");

      expect(result).toEqual(mockCustomer);
    });

    it("should throw NotFoundException if customer not found", async () => {
      mockPrisma.customer.findUnique.mockResolvedValue(null);

      await expect(service.findOne("none")).rejects.toThrow(NotFoundException);
    });
  });

  describe("create", () => {
    it("should create a new customer", async () => {
      mockPrisma.customer.findFirst.mockResolvedValue(null);
      mockPrisma.customer.create.mockResolvedValue(mockCustomer);

      const result = await service.create({ name: "John", email: "john@test.com", phone: "08123" });

      expect(result).toEqual(mockCustomer);
    });

    it("should throw ConflictException if email already exists", async () => {
      mockPrisma.customer.findFirst.mockResolvedValue(mockCustomer);

      await expect(
        service.create({ name: "John", email: "john@test.com", phone: "08123" }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("update", () => {
    it("should update and return the customer", async () => {
      const updated = { ...mockCustomer, name: "Jane" };
      mockPrisma.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrisma.customer.update.mockResolvedValue(updated);

      const result = await service.update("c1", { name: "Jane" });

      expect(result.name).toBe("Jane");
    });

    it("should throw NotFoundException if customer not found", async () => {
      mockPrisma.customer.findUnique.mockResolvedValue(null);

      await expect(service.update("none", { name: "Jane" })).rejects.toThrow(NotFoundException);
    });
  });

  describe("delete", () => {
    it("should delete and return true", async () => {
      mockPrisma.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrisma.customer.delete.mockResolvedValue(mockCustomer);

      const result = await service.delete("c1");

      expect(result).toBe(true);
    });

    it("should throw NotFoundException if customer not found", async () => {
      mockPrisma.customer.findUnique.mockResolvedValue(null);

      await expect(service.delete("none")).rejects.toThrow(NotFoundException);
    });
  });
});
