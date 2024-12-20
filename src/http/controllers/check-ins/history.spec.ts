import request from "supertest";
import { app } from "@/app";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { createAndAuthenticateUser } from "@/utils/test/create-and-authenticate-user";

describe("Check-ins History (e2e)", () => {
  beforeAll(async () => {
    await app.ready();
    vi.useFakeTimers();
  });

  afterEach(async () => {
    vi.useRealTimers();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should be able to fetch the check-in history.", async () => {
    vi.setSystemTime(new Date(2024, 11, 19, 14, 0, 0));

    const { token, cookies } = await createAndAuthenticateUser(app, true);

    const createGymResponse = await request(app.server)
      .post("/gyms")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "JavaScript Gym",
        description: "Some description",
        phone: "11999999999",
        latitude: -22.0552742,
        longitude: -46.965172,
      });

    const { gym } = createGymResponse.body;

    await request(app.server)
      .post(`/gyms/${gym.id}/check-in`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        userLatitude: -22.0552742,
        userLongitude: -46.965172,
      });

    vi.setSystemTime(new Date(2024, 11, 21, 14, 0, 0));

    const refreshTokenResponse = await request(app.server)
      .patch("/token/refresh")
      .set("Cookie", cookies)
      .send();

    const { token: refreshedToken } = refreshTokenResponse.body;

    await request(app.server)
      .post(`/gyms/${gym.id}/check-in`)
      .set("Authorization", `Bearer ${refreshedToken}`)
      .send({
        userLatitude: -22.0552742,
        userLongitude: -46.965172,
      });

    const response = await request(app.server)
      .get(`/check-ins/history`)
      .set("Authorization", `Bearer ${refreshedToken}`)
      .send();

    expect(response.statusCode).toEqual(200);
    expect(response.body.checkIns).toHaveLength(2);
  });
});

