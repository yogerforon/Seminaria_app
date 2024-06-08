export function getClientInfo(request: Request) {
  const ipAddress = request.headers.get('X-Forwarded-For') || request.headers.get('x-forwarded-for')
  const userAgent = request.headers.get('User-Agent') || request.headers.get('user-agent') || '';

  return {
    ipAddress: ipAddress || 'unknown',
    userAgent: userAgent || 'unknown',
  };
}