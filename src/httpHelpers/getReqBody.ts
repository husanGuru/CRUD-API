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
      try {
        const parsedData = JSON.parse(data);
        resolve(parsedData);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_err) {
        reject(
          new Error(
            "Could not parse request body, please pass correct json format"
          )
        );
      }
    });

    req.on("error", (err) => {
      reject(err);
    });
  });
}
