import http, { IncomingMessage } from "http";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import httpHelpers from "./httpHelpers";
import {
  addUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
} from "./store/store";
import { getReqBody } from "./httpHelpers/getReqBody";
import { User } from "./store/user";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const server = http.createServer();
const CLUSTER_MODE = process.env.CLUSTER_MODE ?? false;

server.on("request", (req: IncomingMessage & { pathMatches: boolean }, res) => {
  try {
    console.log(process.env.PORT);

    res.setHeader("Content-Type", "application/json");

    httpHelpers.get("/api/users", req, () => {
      res.statusCode = 200;
      if (CLUSTER_MODE && process.send) {
        process.send({ type: "getAll" });
        process.once("message", (msg: { type: string; data: unknown }) => {
          if (msg?.type === "db") {
            res.end(JSON.stringify(msg.data));
          }
        });
        return;
      }
      res.write(JSON.stringify(getUsers()));
      res.end();
    });

    httpHelpers.get("/api/users/:userId", req, (param) => {
      if (CLUSTER_MODE && process.send) {
        process.send({ type: "getById", payload: param.userId });
        process.once(
          "message",
          (msg: {
            type: string;
            data: { user?: User; message?: string; status?: number };
          }) => {
            if (msg?.type === "db") {
              res.statusCode = msg.data?.status ?? 200;
              res.write(
                JSON.stringify(msg.data.user ?? { message: msg.data.message })
              );
              res.end();
            }
          }
        );
        return;
      }

      const { user, status, message } = getUserById(param.userId);
      res.statusCode = status;
      res.write(JSON.stringify(user ?? { message }));
      res.end();
    });

    httpHelpers.post("/api/users", req, async () => {
      try {
        const { username, age, hobbies } = await getReqBody(req);

        if (!username || !age || !hobbies) {
          res.statusCode = 400;
          res.write(
            JSON.stringify({
              message: "username, age and hobbies are required",
            })
          );

          return res.end();
        }

        if (CLUSTER_MODE && process.send) {
          process.send({ type: "add", payload: { username, age, hobbies } });
          process.once("message", (msg: { type: string; data: unknown }) => {
            if (msg?.type === "db") {
              res.statusCode = 201;
              res.write(JSON.stringify(msg.data));
              res.end();
            }
          });
          return;
        }

        const user = addUser({ username, age, hobbies });
        res.statusCode = 201;
        res.write(JSON.stringify(user));
        res.end();
      } catch (err) {
        console.log(err);
        res.statusCode = 500;
        res.write(
          JSON.stringify({
            message: "Something went wrong, please try again later",
          })
        );
        res.end();
      }
    });

    httpHelpers.put("/api/users/:userId", req, async (param) => {
      const { username, age, hobbies } = await getReqBody(req);

      if (CLUSTER_MODE && process.send) {
        process.send({
          type: "update",
          payload: { id: param.userId, username, age, hobbies },
        });
        process.once(
          "message",
          (msg: {
            type: string;
            data: { user?: User; message?: string; status?: number };
          }) => {
            if (msg?.type === "db") {
              res.statusCode = msg.data.status ?? 200;
              res.write(
                JSON.stringify(msg.data.user ?? { message: msg.data.message })
              );
              res.end();
            }
          }
        );
        return;
      }

      const { user, message, status } = updateUser(param.userId, {
        username,
        age,
        hobbies,
      });
      res.statusCode = status;
      res.write(JSON.stringify(user ?? { message }));
      res.end();
    });

    httpHelpers.delete("/api/users/:userId", req, (param) => {
      if (CLUSTER_MODE && process.send) {
        process.send({
          type: "delete",
          payload: param.userId,
        });
        process.once(
          "message",
          (msg: {
            type: string;
            data: { status: number; message: string };
          }) => {
            if (msg?.type === "db") {
              res.statusCode = msg.data.status ?? 200;
              res.write(JSON.stringify({ message: msg.data.message }));
              res.end();
            }
          }
        );
        return;
      }
      const { status, message } = deleteUser(param.userId);
      res.statusCode = status;
      res.write(JSON.stringify({ message }));
      res.end();
    });

    if (!req.pathMatches && !res.writableEnded) {
      res.statusCode = 404;
      res.end(
        JSON.stringify({
          message: "Path not found",
        })
      );
    }
  } catch (err) {
    console.log(err);
    res.statusCode = 500;
    res.write(
      JSON.stringify({
        message: "Something went wrong, please try again later",
      })
    );
    res.end();
  }
});

server.on("error", (err) => {
  console.error(err);
});

// server.listen(PORT, () => {
//   console.log(`Listening to the port ${PORT}`);
// });

export default server;
