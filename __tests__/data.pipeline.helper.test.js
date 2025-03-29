const { AppDataSource } = require("../config/db");
const {
  processEventLogs,
  processEventLogsForUser,
} = require("../helper/data.pipeline.helper");
jest.mock("../config/db", () => {
  const mockRepository = {
    findOne: jest.fn().mockResolvedValue({ id: "testAppId" }),
    save: jest.fn().mockResolvedValue(undefined),
    create: jest.fn((data) => data),
  };

  return {
    AppDataSource: {
      getRepository: jest.fn(() => mockRepository), // Now mockRepository is initialized properly
    },
  };
});

describe("processEventLogs", () => {
  let mockRepository;

  beforeEach(() => {
    mockRepository = AppDataSource.getRepository(); // Get the same instance used in jest.mock
    jest.clearAllMocks(); // Reset mock call history before each test
  });

  it("should process valid logs and return event summary", async () => {
    const logs = [
      JSON.stringify({
        event: "click",
        referrer: "https://example.com",
        device: "mobile",
        ipAddress: "192.168.1.1",
        metadata: {
          browser: "Chrome",
          os: "Windows 10",
          screenSize: "1920x1080",
        },
        appId: "9b06f136-bcd6-4cbc-bf90-f3e2c23aafcf",
        timeStamp: 1743231706277,
        userId: "dec79ae6-3f71-44d2-a056-32a8dfb6a48d",
      }),
    ];

    const result = await processEventLogs(logs);

    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { id: "9b06f136-bcd6-4cbc-bf90-f3e2c23aafcf" },
    });
    expect(mockRepository.create).toHaveBeenCalled();
    expect(mockRepository.save).toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      event_name: "click",
      app_id: "9b06f136-bcd6-4cbc-bf90-f3e2c23aafcf",
      total_count: 1,
      unique_users_count: 1,
    });
  });
});

describe("processEventLogsForUser", () => {
  it("should process logs and return user stats", async () => {
    const logs = [
      JSON.stringify({
        event: "click",
        referrer: "https://example.com",
        device: "mobile",
        ipAddress: "192.168.1.1",
        metadata: {
          browser: "Chrome",
          os: "Windows 10",
          screenSize: "1920x1080",
        },
        appId: "9b06f136-bcd6-4cbc-bf90-f3e2c23aafcf",
        timeStamp: 1743231706277,
        userId: "dec79ae6-3f71-44d2-a056-32a8dfb6a48d",
      }),
      JSON.stringify({
        event: "click",
        referrer: "https://example.com",
        device: "mobile",
        ipAddress: "192.168.1.1",
        metadata: {
          browser: "Chrome",
          os: "Windows 10",
          screenSize: "1920x1080",
        },
        appId: "9b06f136-bcd6-4cbc-bf90-f3e2c23aafcf",
        timeStamp: 1743231706093,
        userId: "dec79ae6-3f71-44d2-a056-32a8dfb6a48d",
      }),
      JSON.stringify({
        event: "click",
        referrer: "https://example.com",
        device: "mobile",
        ipAddress: "192.168.1.1",
        metadata: {
          browser: "Chrome",
          os: "Windows 10",
          screenSize: "1920x1080",
        },
        appId: "9b06f136-bcd6-4cbc-bf90-f3e2c23aafcf",
        timeStamp: 1743231705917,
        userId: "dec79ae6-3f71-44d2-a056-32a8dfb6a48d",
      }),
      JSON.stringify({
        event: "click",
        referrer: "https://example.com",
        device: "mobile",
        ipAddress: "192.168.1.1",
        metadata: {
          browser: "Chrome",
          os: "Windows 10",
          screenSize: "1920x1080",
        },
        appId: "9b06f136-bcd6-4cbc-bf90-f3e2c23aafcf",
        timeStamp: 1743231705771,
        userId: "dec79ae6-3f71-44d2-a056-32a8dfb6a48d",
      }),
      JSON.stringify({
        event: "click",
        referrer: "https://example.com",
        device: "mobile",
        ipAddress: "192.168.1.1",
        metadata: {
          browser: "Chrome",
          os: "Windows 10",
          screenSize: "1920x1080",
        },
        appId: "9b06f136-bcd6-4cbc-bf90-f3e2c23aafcf",
        timeStamp: 1743231705604,
        userId: "dec79ae6-3f71-44d2-a056-32a8dfb6a48d",
      }),
    ];

    const result = await processEventLogsForUser(logs);

    expect(result).toEqual([
      {
        userId: "dec79ae6-3f71-44d2-a056-32a8dfb6a48d",
        totalEvents: 5,
        deviceDetails: { mobile: 5 },
        ipAddress: "192.168.1.1",
        lastEventTimestamp: expect.any(Date),
      },
    ]);
  });

  it("should skip logs without userId", async () => {
    const logs = [
      JSON.stringify({
        timeStamp: 1711800000000,
        device: "mobile",
        ipAddress: "192.168.1.1",
      }),
      JSON.stringify({
        userId: "user789",
        timeStamp: 1711800500000,
        device: "tablet",
        ipAddress: "192.168.1.3",
      }),
    ];

    const result = await processEventLogsForUser(logs);

    expect(result).toEqual([
      {
        userId: "user789",
        totalEvents: 1,
        deviceDetails: { tablet: 1 },
        ipAddress: "192.168.1.3",
        lastEventTimestamp: new Date(1711800500000),
      },
    ]);
  });

  it("should handle missing ipAddress", async () => {
    const logs = [
      JSON.stringify({
        userId: "user999",
        timeStamp: 1711800000000,
        device: "mobile",
      }),
    ];

    const result = await processEventLogsForUser(logs);

    expect(result).toEqual([
      {
        userId: "user999",
        totalEvents: 1,
        deviceDetails: { mobile: 1 },
        ipAddress: "Unknown",
        lastEventTimestamp: new Date(1711800000000),
      },
    ]);
  });

  it("should update last event timestamp correctly", async () => {
    const logs = [
      JSON.stringify({
        userId: "user123",
        timeStamp: 1711800000000,
        device: "mobile",
        ipAddress: "192.168.1.1",
      }),
      JSON.stringify({
        userId: "user123",
        timeStamp: 1711802000000, // Later timestamp
        device: "desktop",
        ipAddress: "192.168.1.1",
      }),
    ];

    const result = await processEventLogsForUser(logs);

    expect(
      result.find((entry) => entry.userId === "user123").lastEventTimestamp
    ).toEqual(new Date(1711802000000));
  });
});
