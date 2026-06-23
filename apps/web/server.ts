import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import { getEventRoom, REALTIME_EVENTS, type JoinEventPayload } from "./src/features/realtime/events";
import { setRealtimeServer } from "./src/features/realtime/server";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME ?? "0.0.0.0";
const port = Number(process.env.PORT ?? 3000);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();
const prisma = new PrismaClient();

void app.prepare().then(() => {
  const httpServer = createServer((request, response) => {
    void handle(request, response);
  });

  const io = new Server(httpServer, {
    path: "/socket.io",
    cors: {
      origin: process.env.NEXTAUTH_URL ?? "http://localhost:3000",
    },
  });

  io.on("connection", (socket) => {
    socket.on(REALTIME_EVENTS.JOIN_EVENT, async (payload: JoinEventPayload) => {
      if (!payload?.eventId || !payload.token || !["dashboard", "stage"].includes(payload.channel)) {
        return;
      }

      const event = await prisma.event.findFirst({
        where: {
          id: payload.eventId,
          stageToken: payload.token,
        },
        select: {
          id: true,
        },
      });

      if (event) {
        void socket.join(getEventRoom(event.id, payload.channel));
      }
    });
  });

  setRealtimeServer(io);

  httpServer.listen(port, hostname, () => {
    console.log(`GalaGate ready on http://localhost:${port}`);
  });
});
