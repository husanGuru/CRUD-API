import { IncomingMessage } from "http";

export function getReqBody(
  req: IncomingMessage
): Promise<{ username: string; age: number; hobbies: string[] }> {
  let data = "";
  return new Promise((resolve, reject) => {
    req.on("data", (chunk) => {
      data += chunk;
    });

    req.on("end", () => {
      resolve(JSON.parse(data));
    });

    req.on("error", (err) => {
      reject(err);
    });
  });
}
