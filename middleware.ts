import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith('/admin');
  const isLoginPage = pathname === '/admin/login';

  if (!isAdminRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get('admin_token')?.value;

  // If accessing a protected admin route and no token exists
  if (isAdminRoute && !isLoginPage && !token) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If token is present, verify against Supabase Auth API and check ADMIN_EMAIL
  if (token) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const configuredAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

    let isValidSession = false;

    if (supabaseUrl && supabasePublishableKey) {
      try {
        const authRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: supabasePublishableKey,
          },
          cache: 'no-store',
        });

        if (authRes.ok) {
          const userData = await authRes.json();
          const userEmail = userData?.email?.trim().toLowerCase();

          // Strict authorization: Valid session + user.email === ADMIN_EMAIL
          if (userData && userData.id && userEmail) {
            if (configuredAdminEmail && userEmail === configuredAdminEmail) {
              isValidSession = true;
            } else if (!configuredAdminEmail) {
              console.warn("ADMIN_EMAIL environment variable is not configured; denying admin access by default.");
              isValidSession = false;
            } else {
              console.warn(`Admin access denied for email: ${userEmail}. Expected: ${configuredAdminEmail}`);
              isValidSession = false;
            }
          }
        }
      } catch (err) {
        console.error('Middleware Supabase token verification error:', err);
        isValidSession = false;
      }
    }

    // If accessing login page while already authenticated with a valid admin session
    if (isLoginPage && isValidSession) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    // If on protected admin route with invalid, expired, or unauthorized non-admin token
    if (isAdminRoute && !isLoginPage && !isValidSession) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.set('admin_token', '', {
        path: '/',
        expires: new Date(0),
        secure: true,
        sameSite: 'strict',
      });
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

