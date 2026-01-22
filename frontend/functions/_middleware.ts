/**
 * Cloudflare Pages Middleware
 * calcul-1b9.pages.dev → paytools.work 리다이렉트
 */

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);

  // calcul-1b9.pages.dev 도메인에서 접속 시 paytools.work로 리다이렉트
  if (url.hostname === 'calcul-1b9.pages.dev') {
    const redirectUrl = `https://paytools.work${url.pathname}${url.search}`;
    return Response.redirect(redirectUrl, 301);
  }

  // 그 외 요청은 정상 처리
  return context.next();
};
