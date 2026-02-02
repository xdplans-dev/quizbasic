import { getApp, log } from "./app";

(async () => {
  const { httpServer } = await getApp();

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  const host =
    process.env.HOST || (process.platform === "win32" ? "127.0.0.1" : "0.0.0.0");

  const listenOptions: Parameters<typeof httpServer.listen>[0] =
    process.platform === "win32"
      ? { port, host }
      : { port, host, reusePort: true };

  httpServer.listen(listenOptions, () => {
    log(`serving on port ${port}`);
  });
})();
