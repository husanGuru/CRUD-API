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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const server = http.createServer();

server.on("request", (req: IncomingMessage & { pathMatches: boolean }, res) => {
  try {
    //   const { method, url, headers } = req;

    res.setHeader("Content-Type", "application/json");

    httpHelpers.get("/api/users", req, () => {
      res.statusCode = 200;
      res.write(JSON.stringify(getUsers()));
      res.end();
    });

    httpHelpers.get("/api/users/:userId", req, (param) => {
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

    httpHelpers.put("/api/users/:userId", req, async (params) => {
      const { username, age, hobbies } = await getReqBody(req);
      const { user, message, status } = updateUser(params.userId, {
        username,
        age,
        hobbies,
      });
      res.statusCode = status;
      res.write(JSON.stringify(user ?? { message }));
      res.end();
    });

    httpHelpers.delete("/api/users/:userId", req, (params) => {
      const { status, message } = deleteUser(params.userId);

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
