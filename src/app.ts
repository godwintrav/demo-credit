import express, { Request, Response } from "express";

const app = express();

// Middleware
app.use(express.json());

// Routes
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Welcome to the demo credit API!" });
});

export default app;