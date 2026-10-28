/* Hàm Vercel cho /api/stats — xem lib/submissions.mjs. Vercel không ghi được đĩa nên chỉ dùng Redis. */
import { handleStats, storeFor } from "../lib/submissions.mjs"

const handler = (request) => handleStats(request, { store: storeFor(process.env, { allowFile: false }) })

export const GET = handler
export const POST = handler
