import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Gunakan fallback agar tidak error saat Secret tidak terbaca
const secretString = process.env.JWT_SECRET || "rahasia_skripsi_tata_123";
const secret = new TextEncoder().encode(secretString);

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // 1. Biarkan rute login dan public lewat
  if (pathname.startsWith("/login") || pathname === "/") {
    return NextResponse.next();
  }

  // 2. Jika tidak ada token, langsung ke login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // 3. Verifikasi JWT
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role;

    // Proteksi Rute Student
    if (pathname.startsWith("/student") && role !== "student") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Proteksi Rute Teacher
    if (pathname.startsWith("/teacher") && role !== "teacher") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  } catch (err) {
    console.error("MIDDLEWARE JWT ERROR:", err.message);
    // Jika JWT salah, hapus cookie dan pindah ke login
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    return response;
  }
}

export const config = {
  matcher: ["/student/:path*", "/teacher/:path*"]
};