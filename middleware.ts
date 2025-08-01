import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Allow the request to continue if authorized
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Define public routes that don't require authentication
        const publicRoutes = [
          '/',
          '/login',
          '/signup', 
          '/forgot-password',
          '/reset-password'
        ];
        
        // Check if it's a public route or static asset
        const isPublicRoute = publicRoutes.includes(pathname) || 
                             pathname.startsWith('/api/auth') ||
                             pathname.startsWith('/_next') ||
                             pathname.includes('.ico') ||
                             pathname.includes('.svg') ||
                             pathname.includes('.png') ||
                             pathname.includes('.jpg') ||
                             pathname.includes('.css') ||
                             pathname.includes('.js');
        
        // Allow access to public routes
        if (isPublicRoute) {
          return true;
        }
        
        // For protected routes, check if user has valid token
        if (!token) {
          return false; // This will redirect to sign-in page
        }
        
        return true;
      }
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and images
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ]
};
