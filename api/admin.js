/* Hàm Vercel cho /api/admin — dữ liệu cho trang /admin, cần ADMIN_TOKEN. */
import { handleAdmin, storeFor } from "../lib/submissions.mjs"

export const GET = (request) => handleAdmin(request, { store: storeFor(process.env, { allowFile: false }) })
