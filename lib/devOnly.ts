type RouteHandler = (request: Request) => Promise<Response>;

function devOnly(handler: RouteHandler): RouteHandler {
  return async (request) =>
    process.env.NODE_ENV === "development"
      ? handler(request)
      : new Response(null, { status: 404 });
}

export { devOnly };
