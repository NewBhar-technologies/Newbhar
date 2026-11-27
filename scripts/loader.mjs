import { pathToFileURL } from "url";
import path from "path";
import fs from "fs";

const projectRoot = path.resolve(".");

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "next/server") {
    const nextServerPath = path.join(projectRoot, "node_modules", "next", "server.js");
    return nextResolve(pathToFileURL(nextServerPath).href, context);
  }
  if (specifier === "next/headers") {
    const nextHeadersPath = path.join(projectRoot, "node_modules", "next", "headers.js");
    return nextResolve(pathToFileURL(nextHeadersPath).href, context);
  }

  if (specifier.startsWith("@/")) {
    const relPath = specifier.slice(2);
    let absPath = path.join(projectRoot, relPath);

    if (!fs.existsSync(absPath)) {
      if (fs.existsSync(absPath + ".js")) {
        absPath += ".js";
      } else if (fs.existsSync(absPath + ".jsx")) {
        absPath += ".jsx";
      } else if (fs.existsSync(path.join(absPath, "index.js"))) {
        absPath = path.join(absPath, "index.js");
      }
    }

    return nextResolve(pathToFileURL(absPath).href, context);
  }

  return nextResolve(specifier, context);
}
