import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

// Pre-initialize and seed DB on start
import "./db.js";

// Custom Middlewares
import { loggerMiddleware } from "./middlewares/logger.js";
import { errorHandler } from "./middlewares/errorHandler.js";

// Sub-routers
import authRoutes from "./routes/authRoutes.js";
import oauthRoutes from "./routes/oauthRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Standard Express general-purpose middlewares
  app.use(express.json({ limit: "50mb" }));
  
  // Custom API request logging middleware
  app.use(loggerMiddleware);

  // Mount modular sub-routers
  app.use("/api/auth", authRoutes);
  app.use("/auth", oauthRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api", auditRoutes);

  // Serve Single-Page Application (Vite Integration)
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Centred error handling middleware (must be registered last)
  app.use(errorHandler);

  // Start server listening
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[VERIFY-BACKEND] Modular server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
