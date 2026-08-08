import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import authRoutes from "#routes/auth.routes.js";
import testRoutes from "#routes/test.routes.js";
import requestRoutes from "#routes/request.routes.js";
import historyRoutes from "#routes/history.routes.js";
import tabRoutes from "#routes/tab.routes.js";
import collectionRoutes from "#routes/collection.routes.js";
import workspaceRoutes from "#routes/workspace.routes.js";
import usersRoutes from "#routes/users.routes.js";
import profileRoutes from "#routes/profile.routes.js";

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true, // required for cookies to be sent cross-origin
}));
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api", requestRoutes);
app.use("/api", historyRoutes);
app.use("/api", tabRoutes);
app.use("/api", collectionRoutes);
app.use("/api", workspaceRoutes);
app.use("/api", usersRoutes);
app.use("/api", profileRoutes);

export default app;
