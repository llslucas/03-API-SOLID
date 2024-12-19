import { FastifyInstance } from "fastify";
import request from "supertest";

export async function createAndAuthenticateUser(
  app: FastifyInstance
): Promise<{ token: string; cookies: string[] }> {
  await request(app.server).post("/users").send({
    name: "John Doe",
    email: "johndoe@example.com",
    password: "123456",
  });

  const sessionResponse = await request(app.server).post("/sessions").send({
    email: "johndoe@example.com",
    password: "123456",
  });

  const { token } = sessionResponse.body;
  const cookies = sessionResponse.get("Set-Cookie") ?? [""];
  return {
    token,
    cookies,
  };
}

