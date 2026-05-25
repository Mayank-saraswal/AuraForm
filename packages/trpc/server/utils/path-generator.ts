export function generatePath(base: string) {
  return function (path: string): `/${string}` {
    const cleanBase = base.replace(/^\/+|\/+$/g, "");
    const cleanPath = path.replace(/^\/+|\/+$/g, "");
    return `/${[cleanBase, cleanPath].filter(Boolean).join("/")}`;
  };
}

export function openApiMeta(
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
  path: `/${string}`,
  tags: string[],
  protect: boolean = false
) {
  return {
    openapi: {
      method,
      path,
      tags,
      protect,
    },
  };
}
