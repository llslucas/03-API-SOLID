import request from "supertest";
import { app } from "@/app";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createAndAuthenticateUser } from "@/utils/test/create-and-authenticate-user";

describe("Create Check-ins (e2e)", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should be able to create a check-in.", async () => {
    const { token } = await createAndAuthenticateUser(app);

    const gymCreateResponse = await request(app.server)
      .post("/gyms")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "JavaScript Gym",
        description: "Some description",
        phone: "11999999999",
        latitude: -22.0552742,
        longitude: -46.965172,
      });

    const { gym } = gymCreateResponse.body;

    const createResponse = await request(app.server)
      .post(`/gyms/${gym.id}/check-in`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        userLatitude: -22.0552742,
        userLongitude: -46.965172,
      });

    expect(createResponse.statusCode).toEqual(201);
  });
});

