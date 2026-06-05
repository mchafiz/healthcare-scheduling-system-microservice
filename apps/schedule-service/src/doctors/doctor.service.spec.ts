import { Test, TestingModule } from "@nestjs/testing";
import { DoctorService } from "./doctor.service";
import { PrismaService } from "../prisma/prisma.service";
import { NotFoundException, ConflictException } from "@nestjs/common";

const mockPrisma = {
  doctor: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
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
      ],
    }).compile();

    service = module.get<DoctorService>(DoctorService);
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("should return all doctors", async () => {
      mockPrisma.doctor.findMany.mockResolvedValue([mockDoctor]);

      const result = await service.findAll();

      expect(result).toEqual([mockDoctor]);
    });
  });

  describe("findOne", () => {
    it("should return a doctor by id", async () => {
      mockPrisma.doctor.findUnique.mockResolvedValue(mockDoctor);

      const result = await service.findOne("d1");

      expect(result).toEqual(mockDoctor);
    });

    it("should throw NotFoundException if doctor not found", async () => {
      mockPrisma.doctor.findUnique.mockResolvedValue(null);

      await expect(service.findOne("none")).rejects.toThrow(NotFoundException);
    });
  });

  describe("create", () => {
    it("should create a new doctor", async () => {
      mockPrisma.doctor.findFirst.mockResolvedValue(null);
      mockPrisma.doctor.create.mockResolvedValue(mockDoctor);

      const result = await service.create({ name: "Dr. Smith", specialization: "Cardiology" });

      expect(result).toEqual(mockDoctor);
    });

    it("should throw ConflictException if doctor already exists", async () => {
      mockPrisma.doctor.findFirst.mockResolvedValue(mockDoctor);

      await expect(
        service.create({ name: "Dr. Smith", specialization: "Cardiology" }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("update", () => {
    it("should update and return the doctor", async () => {
      const updated = { ...mockDoctor, name: "Dr. Jones" };
      mockPrisma.doctor.findUnique.mockResolvedValue(mockDoctor);
      mockPrisma.doctor.update.mockResolvedValue(updated);

      const result = await service.update("d1", { name: "Dr. Jones" });

      expect(result.name).toBe("Dr. Jones");
    });

    it("should throw NotFoundException if doctor not found", async () => {
      mockPrisma.doctor.findUnique.mockResolvedValue(null);

      await expect(service.update("none", { name: "X" })).rejects.toThrow(NotFoundException);
    });
  });

  describe("delete", () => {
    it("should delete and return true", async () => {
      mockPrisma.doctor.findUnique.mockResolvedValue(mockDoctor);
      mockPrisma.doctor.delete.mockResolvedValue(mockDoctor);

      const result = await service.delete("d1");

      expect(result).toBe(true);
    });

    it("should throw NotFoundException if doctor not found", async () => {
      mockPrisma.doctor.findUnique.mockResolvedValue(null);

      await expect(service.delete("none")).rejects.toThrow(NotFoundException);
    });
  });
});
