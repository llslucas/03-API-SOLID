import { InMemoryCheckInsRepository } from "@/repositories/in-memory/in-memory-check-ins-repository";
import { expect, describe, it, beforeEach, vi, afterEach } from "vitest";
import { CheckInUseCase } from "./check-in";
import { InMemoryGymsRepository } from "@/repositories/in-memory/in-memory-gyms-repository";

let checkInsRepository: InMemoryCheckInsRepository;
let gymsRepository: InMemoryGymsRepository;
let sut: CheckInUseCase;

describe("CheckIn Use Case", () => {
  beforeEach(async () => {
    checkInsRepository = new InMemoryCheckInsRepository();
    gymsRepository = new InMemoryGymsRepository();
    sut = new CheckInUseCase(checkInsRepository, gymsRepository);

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should be able to check in", async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0));

    const gym = await gymsRepository.create({
      title: "gym-01",
      latitude: -22.0552742,
      longitude: -46.965172,
    });

    const { checkIn } = await sut.execute({
      gymId: gym.id,
      userId: "user-01",
      userLatitude: -22.0552742,
      userLongitude: -46.965172,
    });

    console.log(checkIn.created_at);

    expect(checkIn.id).toEqual(expect.any(String));
  });

  it("should not be able to check in twice in the same day", async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0));

    const gym = await gymsRepository.create({
      title: "gym-01",
      latitude: 0,
      longitude: 0,
    });

    await sut.execute({
      gymId: gym.id,
      userId: "user-01",
      userLatitude: 0,
      userLongitude: 0,
    });

    await expect(
      sut.execute({
        gymId: gym.id,
        userId: "user-01",
        userLatitude: 0,
        userLongitude: 0,
      })
    ).rejects.toBeInstanceOf(Error);
  });

  it("should be able to check in twice but in different days", async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0));
    const gym = await gymsRepository.create({
      title: "gym-01",
      latitude: 0,
      longitude: 0,
    });

    await sut.execute({
      gymId: gym.id,
      userId: "user-01",
      userLatitude: 0,
      userLongitude: 0,
    });

    vi.setSystemTime(new Date(2022, 0, 21, 8, 0, 0));
    await expect(
      sut.execute({
        gymId: gym.id,
        userId: "user-01",
        userLatitude: 0,
        userLongitude: 0,
      })
    ).resolves.toBeTruthy();
  });

  it("should not be able to check in on distant gym", async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0));

    const gym = await gymsRepository.create({
      title: "gym-01",
      latitude: -22.0552742,
      longitude: -46.965172,
    });

    await expect(
      sut.execute({
        gymId: gym.id,
        userId: "user-01",
        userLatitude: -22.0559774,
        userLongitude: -46.9849926,
      })
    ).rejects.toBeInstanceOf(Error);
  });
});

