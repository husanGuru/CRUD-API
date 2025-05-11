import { IncomingMessage } from "http";
import { ExtractPathParam } from "src/types/httpHelpers.types";

export function createHandler(method: string) {
  return function <Path extends string>(
    path: Path,
    req: IncomingMessage & { pathMatches: boolean },
    cb: ExtractPathParam<Path> extends never
      ? () => void
      : (param: Record<ExtractPathParam<Path>, string>) => void
  ): void {
    if (req.method !== method.toUpperCase()) return;

    const url = req.url ?? "";
    const pathParts = path.split("/").filter(Boolean);
    const urlParts = url.split("/").filter(Boolean);

    if (pathParts.length !== urlParts.length) return;

    const params: Record<string, string> = {};
    let isMatch = true;

    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      const urlPart = urlParts[i];

      if (part.startsWith(":")) {
        const key = part.slice(1);
        params[key] = urlPart;
      } else if (part !== urlPart) {
        isMatch = false;
        break;
      }
    }

    if (!isMatch) return;

    req.pathMatches = true;

    if (Object.keys(params).length > 0) {
      (cb as (p: typeof params) => void)(params);
    } else {
      (cb as () => void)();
    }
  };
}
