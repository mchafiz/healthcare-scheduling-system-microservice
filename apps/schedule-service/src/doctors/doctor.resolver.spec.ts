import { Test, TestingModule } from "@nestjs/testing";
import { DoctorResolver } from "./doctor.resolver";
import { DoctorService } from "./doctor.service";
import { AuthGuard } from "../auth/auth.guard";

const mockDoctorService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockDoctor = {
  id: "d1",
  name: "Dr. Smith",
  specialization: "Cardiology",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const paginatedResult = { data: [mockDoctor], total: 1 };

describe("DoctorResolver", () => {
  let resolver: DoctorResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DoctorResolver,
        { provide: DoctorService, useValue: mockDoctorService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    resolver = module.get<DoctorResolver>(DoctorResolver);
    jest.clearAllMocks();
  });

  it("doctors() should return paginated doctors without pagination arg", async () => {
    mockDoctorService.findAll.mockResolvedValue(paginatedResult);

    const result = await resolver.doctors();

    expect(mockDoctorService.findAll).toHaveBeenCalledWith(undefined, undefined);
    expect(result).toEqual(paginatedResult);
  });

  it("doctors() should pass skip and take from pagination arg", async () => {
    mockDoctorService.findAll.mockResolvedValue(paginatedResult);

    const result = await resolver.doctors({ skip: 0, take: 5 });

    expect(mockDoctorService.findAll).toHaveBeenCalledWith(0, 5);
    expect(result).toEqual(paginatedResult);
  });

  it("doctor() should return one doctor by id", async () => {
    mockDoctorService.findOne.mockResolvedValue(mockDoctor);

    const result = await resolver.doctor("d1");

    expect(mockDoctorService.findOne).toHaveBeenCalledWith("d1");
    expect(result).toEqual(mockDoctor);
  });

  it("createDoctor() should create and return a doctor", async () => {
    mockDoctorService.create.mockResolvedValue(mockDoctor);
    const input = { name: "Dr. Smith", specialization: "Cardiology" };

    const result = await resolver.createDoctor(input);

    expect(mockDoctorService.create).toHaveBeenCalledWith(input);
    expect(result).toEqual(mockDoctor);
  });

  it("updateDoctor() should update and return a doctor", async () => {
    const updated = { ...mockDoctor, name: "Dr. Jones" };
    mockDoctorService.update.mockResolvedValue(updated);

    const result = await resolver.updateDoctor("d1", { name: "Dr. Jones" });

    expect(mockDoctorService.update).toHaveBeenCalledWith("d1", { name: "Dr. Jones" });
    expect(result.name).toBe("Dr. Jones");
  });

  it("deleteDoctor() should return true", async () => {
    mockDoctorService.delete.mockResolvedValue(true);

    const result = await resolver.deleteDoctor("d1");

    expect(result).toBe(true);
  });
});
