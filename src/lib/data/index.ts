import "server-only";
import { assertLocalModeAllowed, dataMode } from "../config";
import { localRepo } from "./local";
import type { Repo } from "./repo";
import { supabaseRepo } from "./supabase";

export function repo(): Repo {
  assertLocalModeAllowed();
  return dataMode === "supabase" ? supabaseRepo : localRepo;
}

export { DuplicateRegistrationError } from "./repo";
