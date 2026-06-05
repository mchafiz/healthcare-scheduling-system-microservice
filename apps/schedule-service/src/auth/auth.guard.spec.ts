import { AuthGuard } from "./auth.guard";
import { UnauthorizedException } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { of } from "rxjs";

const mockAuthClient = {
  send: jest.fn(),
};

jest.mock("@nestjs/graphql", () => ({
  ...jest.requireActual("@nestjs/graphql"),
  GqlExecutionContext: {
    create: jest.fn(),
  },
}));

const buildContext = (headers: Record<string, string>) => {
  const mockContext = {
    getContext: () => ({ req: { headers, userId: undefined as string | undefined } }),
  };
  (GqlExecutionContext.create as jest.Mock).mockReturnValue(mockContext);
  return {} as any;
};

describe("AuthGuard", () => {
  let guard: AuthGuard;

  beforeEach(() => {
    guard = new AuthGuard(mockAuthClient as any);
    jest.clearAllMocks();
  });

  it("should throw UnauthorizedException when no authorization header", async () => {
    const context = buildContext({});

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException("No authorization header"),
    );
  });

  it("should throw UnauthorizedException when authorization header has no token", async () => {
    const context = buildContext({ authorization: "Bearer " });
    mockAuthClient.send.mockReturnValue(of({ valid: false, userId: null }));

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException("No token provided"),
    );
  });

  it("should throw UnauthorizedException when token is invalid", async () => {
    const context = buildContext({ authorization: "Bearer bad-token" });
    mockAuthClient.send.mockReturnValue(of({ valid: false, userId: null }));

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException("Invalid or expired token"),
    );
  });

  it("should return true and set userId on valid token", async () => {
    const headers = { authorization: "Bearer valid-token" };
    const req = { headers, userId: undefined as string | undefined };
    const mockContext = { getContext: () => ({ req }) };
    (GqlExecutionContext.create as jest.Mock).mockReturnValue(mockContext);

    mockAuthClient.send.mockReturnValue(of({ valid: true, userId: "user-1" }));

    const result = await guard.canActivate({} as any);

    expect(result).toBe(true);
    expect(req.userId).toBe("user-1");
  });
});
