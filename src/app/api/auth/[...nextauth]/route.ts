import { handlers } from "@/lib/auth";

console.log("[NEXTAUTH ROUTE] handlers loaded:", typeof handlers.GET, typeof handlers.POST);

export const { GET, POST } = handlers;
