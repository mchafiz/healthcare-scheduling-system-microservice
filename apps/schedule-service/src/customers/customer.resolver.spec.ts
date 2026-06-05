import { Test, TestingModule } from "@nestjs/testing";
import { CustomersResolver } from "./customer.resolver";
import { CustomerService } from "./customer.service";
import { AuthGuard } from "../auth/auth.guard";

const mockCustomerService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockCustomer = {
  id: "c1",
  name: "John",
  email: "john@test.com",
  phone: "08123",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("CustomersResolver", () => {
  let resolver: CustomersResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersResolver,
        { provide: CustomerService, useValue: mockCustomerService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    resolver = module.get<CustomersResolver>(CustomersResolver);
    jest.clearAllMocks();
  });

  it("customers() should return all customers", async () => {
    mockCustomerService.findAll.mockResolvedValue([mockCustomer]);

    const result = await resolver.customers();

    expect(result).toEqual([mockCustomer]);
  });

  it("customer() should return one customer by id", async () => {
    mockCustomerService.findOne.mockResolvedValue(mockCustomer);

    const result = await resolver.customer("c1");

    expect(mockCustomerService.findOne).toHaveBeenCalledWith("c1");
    expect(result).toEqual(mockCustomer);
  });

  it("createCustomer() should create and return a customer", async () => {
    mockCustomerService.create.mockResolvedValue(mockCustomer);
    const input = { name: "John", email: "john@test.com", phone: "08123" };

    const result = await resolver.createCustomer(input);

    expect(mockCustomerService.create).toHaveBeenCalledWith(input);
    expect(result).toEqual(mockCustomer);
  });

  it("updateCustomer() should update and return a customer", async () => {
    const updated = { ...mockCustomer, name: "Jane" };
    mockCustomerService.update.mockResolvedValue(updated);

    const result = await resolver.updateCustomer("c1", { name: "Jane" });

    expect(mockCustomerService.update).toHaveBeenCalledWith("c1", { name: "Jane" });
    expect(result.name).toBe("Jane");
  });

  it("deleteCustomer() should return true", async () => {
    mockCustomerService.delete.mockResolvedValue(true);

    const result = await resolver.deleteCustomer("c1");

    expect(result).toBe(true);
  });
});
