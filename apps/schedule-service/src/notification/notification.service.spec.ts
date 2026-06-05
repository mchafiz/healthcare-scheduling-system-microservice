import { Test, TestingModule } from "@nestjs/testing";
import { getQueueToken } from "@nestjs/bull";
import { NotificationService } from "./notification.service";

const mockQueue = {
  add: jest.fn(),
};

const createdPayload = {
  customerEmail: "john@test.com",
  customerName: "John",
  doctorName: "Dr. Smith",
  objective: "Checkup",
  scheduledAt: new Date("2026-07-01T09:00:00Z"),
};

const deletedPayload = {
  customerEmail: "john@test.com",
  customerName: "John",
  doctorName: "Dr. Smith",
  scheduledAt: new Date("2026-07-01T09:00:00Z"),
};

describe("NotificationService", () => {
  let service: NotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: getQueueToken("email-queue"), useValue: mockQueue },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    jest.clearAllMocks();
    mockQueue.add.mockResolvedValue({});
  });

  it("notifyScheduleCreated should add schedule-created job to queue", async () => {
    await service.notifyScheduleCreated(createdPayload);

    expect(mockQueue.add).toHaveBeenCalledWith(
      "schedule-created",
      createdPayload,
      expect.objectContaining({ attempts: 3 }),
    );
  });

  it("notifyScheduleDeleted should add schedule-deleted job to queue", async () => {
    await service.notifyScheduleDeleted(deletedPayload);

    expect(mockQueue.add).toHaveBeenCalledWith(
      "schedule-deleted",
      deletedPayload,
      expect.objectContaining({ attempts: 3 }),
    );
  });
});
