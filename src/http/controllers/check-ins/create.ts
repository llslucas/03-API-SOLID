import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { makeCheckInUseCase } from "@/use-cases/factories/make-check-in-use-case";

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createCheckInParamsSchema = z.object({
    gymId: z.string().uuid(),
  });

  const createCheckInBodySchema = z.object({
    userLatitude: z.coerce.number().refine((value) => {
      return Math.abs(value) <= 90;
    }),
    userLongitude: z.coerce.number().refine((value) => {
      return Math.abs(value) <= 180;
    }),
  });

  const { gymId } = createCheckInParamsSchema.parse(request.params);

  const { userLatitude, userLongitude } = createCheckInBodySchema.parse(
    request.body
  );

  const checkInUseCase = makeCheckInUseCase();

  const { checkIn } = await checkInUseCase.execute({
    userId: request.user.sub,
    gymId,
    userLatitude,
    userLongitude,
  });

  return reply.status(201).send({
    checkIn,
  });
}

