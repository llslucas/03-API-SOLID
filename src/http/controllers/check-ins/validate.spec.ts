import request from "supertest";
import { app } from "@/app";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createAndAuthenticateUser } from "@/utils/test/create-and-authenticate-user";

describe("Validate Check-in (e2e)", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should be able to validate the check-in.", async () => {
    const { token } = await createAndAuthenticateUser(app);

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

    const createCheckInResponse = await request(app.server)
      .post(`/gyms/${gym.id}/check-in`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        userLatitude: -22.0552742,
        userLongitude: -46.965172,
      });

    const { checkIn } = createCheckInResponse.body;

    const response = await request(app.server)
      .patch(`/check-ins/${checkIn.id}/validate`)
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(response.statusCode).toEqual(204);

    const checkInHistoryResponse = await request(app.server)
      .get(`/check-ins/history`)
      .set("Authorization", `Bearer ${token}`)
      .send();

    const { checkIns } = checkInHistoryResponse.body;

    expect(checkIns[0].validated_at).toEqual(expect.any(String));
  });
});

