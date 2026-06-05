import { Test, TestingModule } from "@nestjs/testing";
import { SchedulesResolver } from "./schedule.resolver";
import { ScheduleService } from "./schedule.service";
import { AuthGuard } from "../auth/auth.guard";

const mockScheduleService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
};

const mockSchedule = {
  id: "s1",
  objective: "Checkup",
  customerId: "c1",
  doctorId: "d1",
  scheduledAt: new Date("2026-06-10T08:00:00Z"),
  customer: { id: "c1", name: "John" },
  doctor: { id: "d1", name: "Dr. Smith" },
  createdAt: new Date(),
  updatedAt: new Date(),
};

const paginatedResult = { data: [mockSchedule], total: 1 };

describe("SchedulesResolver", () => {
  let resolver: SchedulesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulesResolver,
        { provide: ScheduleService, useValue: mockScheduleService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    resolver = module.get<SchedulesResolver>(SchedulesResolver);
    jest.clearAllMocks();
  });

  it("schedules() should return paginated schedules without args", async () => {
    mockScheduleService.findAll.mockResolvedValue(paginatedResult);

    const result = await resolver.schedules();

    expect(mockScheduleService.findAll).toHaveBeenCalledWith(undefined, undefined, undefined);
    expect(result).toEqual(paginatedResult);
  });

  it("schedules() should pass pagination skip/take", async () => {
    mockScheduleService.findAll.mockResolvedValue(paginatedResult);

    await resolver.schedules({ skip: 0, take: 5 });

    expect(mockScheduleService.findAll).toHaveBeenCalledWith(0, 5, undefined);
  });

  it("schedules() should pass filter", async () => {
    mockScheduleService.findAll.mockResolvedValue(paginatedResult);

    await resolver.schedules(undefined, { doctorId: "d1" });

    expect(mockScheduleService.findAll).toHaveBeenCalledWith(undefined, undefined, { doctorId: "d1" });
  });

  it("schedule() should return one schedule by id", async () => {
    mockScheduleService.findOne.mockResolvedValue(mockSchedule);

    const result = await resolver.schedule("s1");

    expect(mockScheduleService.findOne).toHaveBeenCalledWith("s1");
    expect(result).toEqual(mockSchedule);
  });

  it("createSchedule() should create and return a schedule", async () => {
    mockScheduleService.create.mockResolvedValue(mockSchedule);
    const input = {
      objective: "Checkup",
      customerId: "c1",
      doctorId: "d1",
      scheduledAt: new Date("2026-06-10T08:00:00Z"),
    };

    const result = await resolver.createSchedule(input);

    expect(mockScheduleService.create).toHaveBeenCalledWith(input);
    expect(result).toEqual(mockSchedule);
  });

  it("deleteSchedule() should return true", async () => {
    mockScheduleService.delete.mockResolvedValue(true);

    const result = await resolver.deleteSchedule("s1");

    expect(result).toBe(true);
  });
});
