import { NextResponse } from 'next/server';

export function middleware(request) {
  const response = NextResponse.next();

  // CSP ヘッダーを設定（unsafe-eval を許可）
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' https: data:; font-src 'self' https: data:; connect-src 'self' https://www.googleapis.com https://hn.algolia.com https://api.anthropic.com https://note.com; frame-src 'none';"
  );

  return response;
}

export const config = {
  matcher: '/:path*',
};
