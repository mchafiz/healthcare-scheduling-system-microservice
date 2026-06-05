import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";

jest.mock("bcrypt");

const mockUsersService = {
  findByEmail: jest.fn(),
  create: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};

describe("AuthService", () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should register a new user and return token", async () => {
      const input = { email: "new@test.com", password: "password123" };
      const createdUser = { id: "1", email: input.email, password: "hashed" };

      mockUsersService.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed");
      mockUsersService.create.mockResolvedValue(createdUser);
      mockJwtService.sign.mockReturnValue("jwt-token");

      const result = await service.register(input);

      expect(result.token).toBe("jwt-token");
      expect(result.user).toEqual(createdUser);
    });

    it("should throw ConflictException if email already registered", async () => {
      mockUsersService.findByEmail.mockResolvedValue({ id: "1", email: "existing@test.com" });

      await expect(
        service.register({ email: "existing@test.com", password: "pass" }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("login", () => {
    it("should return token on valid credentials", async () => {
      const user = { id: "1", email: "user@test.com", password: "hashed" };

      mockUsersService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue("jwt-token");

      const result = await service.login({ email: user.email, password: "password123" });

      expect(result.token).toBe("jwt-token");
      expect(result.user).toEqual(user);
    });

    it("should throw UnauthorizedException if user not found", async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: "notfound@test.com", password: "pass" }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException if password is wrong", async () => {
      mockUsersService.findByEmail.mockResolvedValue({ id: "1", email: "user@test.com", password: "hashed" });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: "user@test.com", password: "wrongpass" }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("validateToken", () => {
    it("should return valid true with userId on valid token", async () => {
      mockJwtService.verify.mockReturnValue({ sub: "1", email: "user@test.com" });

      const result = await service.validateToken("valid-token");

      expect(result).toEqual({ valid: true, userId: "1" });
    });

    it("should return valid false when token is invalid", async () => {
      mockJwtService.verify.mockImplementation(() => { throw new Error("invalid"); });

      const result = await service.validateToken("bad-token");

      expect(result).toEqual({ valid: false, userId: null });
    });
  });
});
