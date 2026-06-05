import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

const mockAuthService = {
  validateToken: jest.fn(),
};

describe("AuthController", () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  describe("validateToken", () => {
    it("should return valid true when token is valid", async () => {
      mockAuthService.validateToken.mockResolvedValue({ valid: true, userId: "1" });

      const result = await controller.validateToken({ token: "valid-token" });

      expect(mockAuthService.validateToken).toHaveBeenCalledWith("valid-token");
      expect(result).toEqual({ valid: true, userId: "1" });
    });

    it("should return valid false when token is invalid", async () => {
      mockAuthService.validateToken.mockResolvedValue({ valid: false, userId: null });

      const result = await controller.validateToken({ token: "bad-token" });

      expect(result).toEqual({ valid: false, userId: null });
    });
  });
});
