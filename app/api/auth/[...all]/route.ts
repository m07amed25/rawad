import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const res = await auth.handler(req);
    if (!res.ok) {
      const clone = res.clone();
      const text = await clone.text();
      fs.appendFileSync(
        path.join(process.cwd(), 'auth-err.log'), 
        `Resp: ${res.status} Text: ${text}\n`
      );
    }
    return res;
  } catch (err: unknown) {
    if (err instanceof Error) {
      fs.appendFileSync(path.join(process.cwd(), 'auth-err.log'), `CAUGHT: ${err.message}\n${err.stack}\n`);
    }
    throw err;
  }
}

export const GET = auth.handler;
