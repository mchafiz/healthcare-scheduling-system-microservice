import { CacheService } from "./cache.service";

const mockRedisClient = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  keys: jest.fn(),
  quit: jest.fn().mockResolvedValue("OK"),
};

describe("CacheService", () => {
  let service: CacheService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRedisClient.quit.mockResolvedValue("OK");
    service = new CacheService();
    // Inject mock client without real Redis connection
    (service as any).client = mockRedisClient;
  });

  describe("get", () => {
    it("should return parsed value when key exists", async () => {
      mockRedisClient.get.mockResolvedValue(JSON.stringify({ id: "1" }));

      const result = await service.get("test-key");

      expect(result).toEqual({ id: "1" });
    });

    it("should return null when key does not exist", async () => {
      mockRedisClient.get.mockResolvedValue(null);

      const result = await service.get("missing-key");

      expect(result).toBeNull();
    });
  });

  describe("set", () => {
    it("should serialize value and set with TTL", async () => {
      mockRedisClient.set.mockResolvedValue("OK");

      await service.set("key", { foo: "bar" }, 30);

      expect(mockRedisClient.set).toHaveBeenCalledWith("key", JSON.stringify({ foo: "bar" }), "EX", 30);
    });

    it("should use default TTL of 60 seconds", async () => {
      mockRedisClient.set.mockResolvedValue("OK");

      await service.set("key", "value");

      expect(mockRedisClient.set).toHaveBeenCalledWith("key", JSON.stringify("value"), "EX", 60);
    });
  });

  describe("del", () => {
    it("should delete a key", async () => {
      mockRedisClient.del.mockResolvedValue(1);

      await service.del("key");

      expect(mockRedisClient.del).toHaveBeenCalledWith("key");
    });
  });

  describe("delByPattern", () => {
    it("should delete all keys matching pattern", async () => {
      mockRedisClient.keys.mockResolvedValue(["customers:1", "customers:2"]);
      mockRedisClient.del.mockResolvedValue(2);

      await service.delByPattern("customers:*");

      expect(mockRedisClient.keys).toHaveBeenCalledWith("customers:*");
      expect(mockRedisClient.del).toHaveBeenCalledWith("customers:1", "customers:2");
    });

    it("should not call del when no keys match", async () => {
      mockRedisClient.keys.mockResolvedValue([]);

      await service.delByPattern("customers:*");

      expect(mockRedisClient.del).not.toHaveBeenCalled();
    });
  });

  describe("onModuleDestroy", () => {
    it("should call quit on Redis client", async () => {
      await service.onModuleDestroy();

      expect(mockRedisClient.quit).toHaveBeenCalled();
    });
  });
});
