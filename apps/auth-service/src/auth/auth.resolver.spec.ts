import { Test, TestingModule } from "@nestjs/testing";
import { AuthResolver } from "./auth.resolver";
import { AuthService } from "./auth.service";

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
};

const mockAuthResponse = {
  token: "jwt-token",
  user: { id: "1", email: "test@test.com", password: "hashed", createdAt: new Date(), updatedAt: new Date() },
};

describe("AuthResolver", () => {
  let resolver: AuthResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
    jest.clearAllMocks();
  });

  describe("healthCheck", () => {
    it("should return health message", () => {
      expect(resolver.healthCheck()).toBe("Auth Service is running");
    });
  });

  describe("register", () => {
    it("should call authService.register and return result", async () => {
      mockAuthService.register.mockResolvedValue(mockAuthResponse);
      const input = { email: "test@test.com", password: "pass123" };

      const result = await resolver.register(input);

      expect(mockAuthService.register).toHaveBeenCalledWith(input);
      expect(result).toEqual(mockAuthResponse);
    });
  });

  describe("login", () => {
    it("should call authService.login and return result", async () => {
      mockAuthService.login.mockResolvedValue(mockAuthResponse);
      const input = { email: "test@test.com", password: "pass123" };

      const result = await resolver.login(input);

      expect(mockAuthService.login).toHaveBeenCalledWith(input);
      expect(result).toEqual(mockAuthResponse);
    });
  });
});
