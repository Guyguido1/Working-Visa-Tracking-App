import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const sessionId = request.cookies.get("session_id")?.value
  const { pathname } = request.nextUrl

  // Define public paths that don't require authentication
  const publicPaths = ["/login", "/register", "/"]

  // Define auth paths that should redirect to dashboard when session exists
  const authPaths = ["/login", "/register"]

  // Check if the path is public
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))

  // Check if the path is an auth path (login/register)
  const isAuthPath = authPaths.some((path) => pathname === path)

  // If the path is not public and there's no session, redirect to login
  if (!isPublicPath && !sessionId) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If the path is an auth path (login/register) and there's a session, redirect to dashboard
  if (isAuthPath && sessionId) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
