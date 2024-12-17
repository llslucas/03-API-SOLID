import { FastifyReply, FastifyRequest } from "fastify";

export async function verifyJWT(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    reply.status(401).send({ message: "Unauthorized" });
  }
}

