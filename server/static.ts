import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(process.cwd(), "dist", "public");
  const legacyDistPath = path.resolve(__dirname, "public");
  const publicPath = fs.existsSync(distPath) ? distPath : legacyDistPath;
  if (!fs.existsSync(publicPath)) {
    throw new Error(
      `Could not find the build directory. Looked in: ${distPath} and ${legacyDistPath}.`,
    );
  }

  app.use(express.static(publicPath));

  // fall through to index.html if the file doesn't exist
  app.use("/{*path}", (_req, res) => {
    res.sendFile(path.resolve(publicPath, "index.html"));
  });
}
