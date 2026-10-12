import { app } from "./app.js";

const PORT = Number(process.env.PORT) || 5000;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server started on port ${PORT} (${process.env.NODE_ENV ?? "development"})`);
});

server.on("error", (err) => {
  console.error("Server failed to start:", err);
  process.exit(1);
});