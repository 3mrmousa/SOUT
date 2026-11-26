import http from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { db } from "./prisma/db";
import { parseCookie } from "cookie";
import type { JWTPayload } from "./types/types";

const onlineUsers = new Map<string, Set<string>>();

export function isUserOnline(userId: string) {
  return onlineUsers.has(userId) && onlineUsers.get(userId)?.size;
}

export function getOnlineUserIds(): string[] {
  return Array.from(onlineUsers.keys());
}

let io: Server | null = null;

export function initSocket(httpServer: http.Server): Server {
  const ioServer = new Server(httpServer, {
    cors: {
      origin: [
        process.env.CLIENT_URL ?? "http://localhost:5001",
        process.env.MOBILE_URL ?? "http://localhost",
      ],
      credentials: true,
    },
  });
  io = ioServer;

  ioServer.use(async (socket: Socket, next) => {
    try {
      const cookies = parseCookie(socket.handshake.headers.cookie || "");
      const token = cookies.access_token;

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "",
      ) as JWTPayload;

      if (!decoded.userId || !decoded.username) {
        return next(new Error("Authentication error: Invalid token payload"));
      }

      const user = await db.orm.public.User.first({
        id: decoded.userId,
        username: decoded.username,
      });

      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      socket.data.user = user;
      socket.data.userId = user.id;
      next();
    } catch (error) {
      console.error("WebSocket authentication error:", error);
      return next(new Error("Authentication error: Unauthorized"));
    }
  });

  ioServer.on("connection", async (socket: Socket) => {
    const userId: string = socket.data.userId;

    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }

    onlineUsers.get(userId)!.add(socket.id);

    socket.join(`user:${userId}`);

    socket.emit("get_online_users", getOnlineUserIds());
    socket.broadcast.emit("user_online", { userId });

    try {
      const undelivered = await db.orm.public.Message.where((m) =>
        m.conversation.some((c) =>
          c.participants.some((p) => p.userId.eq(userId)),
        ),
      )
        .where((m) => m.senderId.neq(userId))
        .where((m) => m.status.eq("SENT"))
        .all();

      for (const msg of undelivered) {
        await db.orm.public.Message.where({ id: msg.id }).update({
          status: "DELIVERED",
        });
        ioServer.to(`user:${msg.senderId}`).emit("message_delivered", {
          messageId: msg.id,
          conversationId: msg.conversationId,
          status: "DELIVERED",
        });
      }
    } catch (error) {
      console.error("Catch-up delivery error:", error);
    }

    socket.on("get_online_users", () => {
      socket.emit("get_online_users", getOnlineUserIds());
    });

    socket.on("ping", (callback) => {
      if (typeof callback === "function") callback();
    });

    socket.on("mark_as_read", async ({ conversationId, senderId }) => {
      try {
        await db.orm.public.Message.where({ conversationId, senderId })
          .where((m) => m.status.neq("READ"))
          .update({ status: "READ" });

        ioServer.to(`user:${senderId}`).emit("messages_read", {
          conversationId,
          readBy: userId,
          status: "READ",
        });
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    });

    socket.on("typing", ({ conversationId, recipientId }) => {
      ioServer.to(`user:${recipientId}`).emit("user_typing", {
        conversationId,
        userId,
        isTyping: true,
      });
    });

    socket.on("stop_typing", ({ conversationId, recipientId }) => {
      ioServer.to(`user:${recipientId}`).emit("user_stop_typing", {
        conversationId,
        userId,
        isTyping: false,
      });
    });

    socket.on("recording", ({ conversationId, recipientId }) => {
      ioServer.to(`user:${recipientId}`).emit("user_recording", {
        conversationId,
        userId,
        isRecording: true,
      });
    });

    socket.on("stop_recording", ({ conversationId, recipientId }) => {
      ioServer.to(`user:${recipientId}`).emit("user_stop_recording", {
        conversationId,
        userId,
        isRecording: false,
      });
    });

    socket.on("disconnect", () => {
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          ioServer.emit("user_offline", { userId });
        }
      }
    });
  });

  return ioServer;
}

export function getIO(): Server {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
}

export function forceLogoutAllSessions(userId: string) {
  if (!io) return;
  const room = `user:${userId}`;

  io.to(room).emit("force_logout");

  setTimeout(() => {
    io?.in(room).disconnectSockets(true);
  }, 100);
}
