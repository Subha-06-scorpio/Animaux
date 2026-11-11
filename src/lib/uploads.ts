import "server-only";
import path from "node:path";

/** Where local-development uploads are stored (served by app/media/[...path]). */
export const UPLOAD_DIR = path.join(process.env.LOCAL_DATA_DIR ?? path.join(process.cwd(), ".data"), "uploads");

export const SUBMISSION_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
export const SUBMISSION_MAX_BYTES = 10 * 1024 * 1024;
