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
import { multiCommunicate } from "./utils/multi";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const server = http.createServer();
const CLUSTER_MODE = process.env.CLUSTER_MODE ?? false;

server.on("request", (req: IncomingMessage & { pathMatches: boolean }, res) => {
  try {
    res.setHeader("Content-Type", "application/json");

    httpHelpers.get("/api/users", req, async () => {
      res.statusCode = 200;
      let users;
      if (CLUSTER_MODE) {
        ({ data: users } = await multiCommunicate({ type: "getAll" }));
      } else {
        ({ data: users } = getUsers());
      }
      res.write(JSON.stringify(users));
      res.end();
    });

    httpHelpers.get("/api/users/:userId", req, async (param) => {
      let user;
      let status;
      let message;
      if (CLUSTER_MODE) {
        ({
          data: user,
          status,
          message,
        } = await multiCommunicate({
          type: "getById",
          payload: { userId: param.userId },
        }));
      } else {
        ({ data: user, status, message } = getUserById(param.userId));
      }

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

        let user;
        if (CLUSTER_MODE) {
          user = await multiCommunicate({
            type: "add",
            payload: { username, age, hobbies },
          });
        } else {
          ({ data: user } = addUser({ username, age, hobbies }));
        }

        res.statusCode = 201;
        res.write(JSON.stringify(user));
        res.end();
      } catch (err: unknown) {
        res.statusCode = 500;

        if (err instanceof Error) {
          res.write(
            JSON.stringify({
              message: err.message,
            })
          );
        } else {
          res.write(
            JSON.stringify({
              message: "Something went wrong, please try again later",
            })
          );
        }
        res.end();
      }
    });

    httpHelpers.put("/api/users/:userId", req, async (param) => {
      const { username, age, hobbies } = await getReqBody(req);

      let user;
      let status;
      let message;
      if (CLUSTER_MODE) {
        ({
          data: user,
          message,
          status,
        } = await multiCommunicate({
          type: "update",
          payload: { userId: param.userId, username, age, hobbies },
        }));
      } else {
        ({
          data: user,
          message,
          status,
        } = updateUser(param.userId, {
          username,
          age,
          hobbies,
        }));
      }

      res.statusCode = status;
      res.write(JSON.stringify(user ?? { message }));
      res.end();
    });

    httpHelpers.delete("/api/users/:userId", req, async (param) => {
      let status;
      let message;
      if (CLUSTER_MODE) {
        ({ status, message } = await multiCommunicate({
          type: "delete",
          payload: { userId: param.userId },
        }));
      } else {
        ({ status, message } = deleteUser(param.userId));
      }

      res.statusCode = status;
      res.write(JSON.stringify({ message: message })); //if status 204 response body will be empty
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
