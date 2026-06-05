import { Test, TestingModule } from "@nestjs/testing";
import { ScheduleService } from "./schedule.service";
import { PrismaService } from "../prisma/prisma.service";
import { NotFoundException, BadRequestException } from "@nestjs/common";

const mockPrisma = {
  schedule: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  customer: {
    findUnique: jest.fn(),
  },
  doctor: {
    findUnique: jest.fn(),
  },
};

const start = new Date("2026-06-10T08:00:00Z");
const end = new Date("2026-06-10T09:00:00Z");

const mockCustomer = { id: "c1", name: "John", email: "john@test.com", phone: "08123" };
const mockDoctor = { id: "d1", name: "Dr. Smith", specialization: "Cardiology" };
const mockSchedule = {
  id: "s1",
  customerId: "c1",
  doctorId: "d1",
  startTime: start,
  endTime: end,
  customer: mockCustomer,
  doctor: mockDoctor,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("ScheduleService", () => {
  let service: ScheduleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduleService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ScheduleService>(ScheduleService);
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("should return all schedules with relations", async () => {
      mockPrisma.schedule.findMany.mockResolvedValue([mockSchedule]);

      const result = await service.findAll();

      expect(result).toEqual([mockSchedule]);
      expect(mockPrisma.schedule.findMany).toHaveBeenCalledWith({
        include: { doctor: true, customer: true },
      });
    });
  });

  describe("findOne", () => {
    it("should return a schedule by id", async () => {
      mockPrisma.schedule.findUnique.mockResolvedValue(mockSchedule);

      const result = await service.findOne("s1");

      expect(result).toEqual(mockSchedule);
    });

    it("should throw NotFoundException if schedule not found", async () => {
      mockPrisma.schedule.findUnique.mockResolvedValue(null);

      await expect(service.findOne("none")).rejects.toThrow(NotFoundException);
    });
  });

  describe("create", () => {
    const input = { customerId: "c1", doctorId: "d1", startTime: start, endTime: end };

    it("should create a schedule successfully", async () => {
      mockPrisma.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrisma.doctor.findUnique.mockResolvedValue(mockDoctor);
      mockPrisma.schedule.findFirst.mockResolvedValue(null);
      mockPrisma.schedule.create.mockResolvedValue(mockSchedule);

      const result = await service.create(input);

      expect(result).toEqual(mockSchedule);
    });

    it("should throw NotFoundException if customer not found", async () => {
      mockPrisma.customer.findUnique.mockResolvedValue(null);

      await expect(service.create(input)).rejects.toThrow(NotFoundException);
    });

    it("should throw NotFoundException if doctor not found", async () => {
      mockPrisma.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrisma.doctor.findUnique.mockResolvedValue(null);

      await expect(service.create(input)).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException if endTime <= startTime", async () => {
      mockPrisma.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrisma.doctor.findUnique.mockResolvedValue(mockDoctor);

      await expect(
        service.create({ ...input, endTime: start }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException if doctor has a conflicting schedule", async () => {
      mockPrisma.customer.findUnique.mockResolvedValue(mockCustomer);
      mockPrisma.doctor.findUnique.mockResolvedValue(mockDoctor);
      mockPrisma.schedule.findFirst.mockResolvedValue(mockSchedule);

      await expect(service.create(input)).rejects.toThrow(BadRequestException);
    });
  });

  describe("delete", () => {
    it("should delete and return true", async () => {
      mockPrisma.schedule.findUnique.mockResolvedValue(mockSchedule);
      mockPrisma.schedule.delete.mockResolvedValue(mockSchedule);

      const result = await service.delete("s1");

      expect(result).toBe(true);
    });

    it("should throw NotFoundException if schedule not found", async () => {
      mockPrisma.schedule.findUnique.mockResolvedValue(null);

      await expect(service.delete("none")).rejects.toThrow(NotFoundException);
    });
  });
});
