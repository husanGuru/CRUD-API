import { User } from "src/store/user";
import { Payload, SendType } from "src/types/cluster.types";

type ReturnType = {
  status: number;
  message?: string | null;
  data?: User | User[] | null;
};
interface Message {
  type: string;
  data: ReturnType;
}

export async function multiCommunicate({
  type,
  payload = {},
}: {
  type: SendType;
  payload?: Payload;
}): Promise<ReturnType> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return new Promise((resolve, _reject) => {
    if (process.send) {
      process.send({ type: type, payload: payload });

      process.once("message", (msg: Message) => {
        if (msg.type === "db") {
          resolve(msg.data);
        }
      });
    }
  });
}
