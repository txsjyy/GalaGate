import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { getEventRoom, REALTIME_EVENTS } from "./src/features/realtime/events";
import { setRealtimeServer } from "./src/features/realtime/server";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME ?? "0.0.0.0";
const port = Number(process.env.PORT ?? 3000);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

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
    socket.on(REALTIME_EVENTS.JOIN_EVENT, (eventId: string) => {
      if (eventId) {
        void socket.join(getEventRoom(eventId));
      }
    });
  });

  setRealtimeServer(io);

  httpServer.listen(port, hostname, () => {
    console.log(`GalaGate ready on http://localhost:${port}`);
  });
});
