// Re-export the singleton db instance from client.ts
// This file exists for backward compatibility with existing imports
export { db } from "./client";
export type { Db } from "./client";