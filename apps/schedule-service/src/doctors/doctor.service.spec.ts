import { Test, TestingModule } from "@nestjs/testing";
import { DoctorService } from "./doctor.service";
import { PrismaService } from "../prisma/prisma.service";
import { CacheService } from "../cache/cache.service";
import { NotFoundException, ConflictException } from "@nestjs/common";

const mockPrisma = {
  doctor: {
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

const mockDoctor = {
  id: "d1",
  name: "Dr. Smith",
  specialization: "Cardiology",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("DoctorService", () => {
  let service: DoctorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DoctorService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CacheService, useValue: mockCache },
      ],
    }).compile();

    service = module.get<DoctorService>(DoctorService);
    jest.clearAllMocks();
    mockCache.get.mockResolvedValue(null);
    mockCache.set.mockResolvedValue(undefined);
    mockCache.del.mockResolvedValue(undefined);
    mockCache.delByPattern.mockResolvedValue(undefined);
  });

  describe("findAll", () => {
    it("should return paginated doctors from DB on cache miss", async () => {
      mockPrisma.doctor.findMany.mockResolvedValue([mockDoctor]);
      mockPrisma.doctor.count.mockResolvedValue(1);

      const result = await service.findAll();

      expect(result).toEqual({ data: [mockDoctor], total: 1 });
      expect(mockPrisma.doctor.findMany).toHaveBeenCalledWith({ skip: 0, take: 10 });
      expect(mockCache.set).toHaveBeenCalled();
    });

    it("should return cached result on cache hit", async () => {
      const cached = { data: [mockDoctor], total: 1 };
      mockCache.get.mockResolvedValue(cached);

      const result = await service.findAll();

      expect(result).toEqual(cached);
      expect(mockPrisma.doctor.findMany).not.toHaveBeenCalled();
    });

    it("should pass custom skip and take", async () => {
      mockPrisma.doctor.findMany.mockResolvedValue([mockDoctor]);
      mockPrisma.doctor.count.mockResolvedValue(3);

      const result = await service.findAll(1, 5);

      expect(result).toEqual({ data: [mockDoctor], total: 3 });
      expect(mockPrisma.doctor.findMany).toHaveBeenCalledWith({ skip: 1, take: 5 });
    });
  });

  describe("findOne", () => {
    it("should return a doctor from DB on cache miss", async () => {
      mockPrisma.doctor.findUnique.mockResolvedValue(mockDoctor);

      const result = await service.findOne("d1");

      expect(result).toEqual(mockDoctor);
      expect(mockCache.set).toHaveBeenCalled();
    });

    it("should return cached doctor on cache hit", async () => {
      mockCache.get.mockResolvedValue(mockDoctor);

      const result = await service.findOne("d1");

      expect(result).toEqual(mockDoctor);
      expect(mockPrisma.doctor.findUnique).not.toHaveBeenCalled();
    });

    it("should throw NotFoundException if doctor not found", async () => {
      mockPrisma.doctor.findUnique.mockResolvedValue(null);

      await expect(service.findOne("none")).rejects.toThrow(NotFoundException);
    });
  });

  describe("create", () => {
    it("should create a new doctor and invalidate cache", async () => {
      mockPrisma.doctor.findFirst.mockResolvedValue(null);
      mockPrisma.doctor.create.mockResolvedValue(mockDoctor);

      const result = await service.create({ name: "Dr. Smith", specialization: "Cardiology" });

      expect(result).toEqual(mockDoctor);
      expect(mockCache.delByPattern).toHaveBeenCalledWith("doctors:*");
    });

    it("should throw ConflictException if doctor already exists", async () => {
      mockPrisma.doctor.findFirst.mockResolvedValue(mockDoctor);

      await expect(
        service.create({ name: "Dr. Smith", specialization: "Cardiology" }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("update", () => {
    it("should update and invalidate cache", async () => {
      const updated = { ...mockDoctor, name: "Dr. Jones" };
      mockPrisma.doctor.findUnique.mockResolvedValue(mockDoctor);
      mockPrisma.doctor.update.mockResolvedValue(updated);

      const result = await service.update("d1", { name: "Dr. Jones" });

      expect(result.name).toBe("Dr. Jones");
      expect(mockCache.delByPattern).toHaveBeenCalledWith("doctors:*");
    });

    it("should throw NotFoundException if doctor not found", async () => {
      mockPrisma.doctor.findUnique.mockResolvedValue(null);

      await expect(service.update("none", { name: "X" })).rejects.toThrow(NotFoundException);
    });
  });

  describe("delete", () => {
    it("should delete and invalidate cache", async () => {
      mockPrisma.doctor.findUnique.mockResolvedValue(mockDoctor);
      mockPrisma.doctor.delete.mockResolvedValue(mockDoctor);

      const result = await service.delete("d1");

      expect(result).toBe(true);
      expect(mockCache.delByPattern).toHaveBeenCalledWith("doctors:*");
    });

    it("should throw NotFoundException if doctor not found", async () => {
      mockPrisma.doctor.findUnique.mockResolvedValue(null);

      await expect(service.delete("none")).rejects.toThrow(NotFoundException);
    });
  });
});
