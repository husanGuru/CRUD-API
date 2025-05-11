import cluster from "cluster";
import http from "http";
import { availableParallelism } from "os";
import server from "./app";
import {
  addUser,
  getUsers,
  getUserById,
  deleteUser,
  updateUser,
} from "./store/store";
import { Payload, SendType } from "./types/cluster.types";

const numCPUs = availableParallelism();
const PORT = Number(process.env.PORT) || 3000;
const workerPorts: number[] = [];
let current = 0;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);
  const numWorkers = numCPUs - 1;

  // Fork workers.
  for (let i = 1; i <= numWorkers; i++) {
    const port = PORT + i;
    const worker = cluster.fork({ PORT: port });
    workerPorts.push(port);

    worker.on("message", (msg: { type: SendType; payload: Payload }) => {
      switch (msg.type) {
        case "getAll":
          worker.send({ type: "db", data: getUsers() });
          break;
        case "getById":
          if (msg.payload.userId) {
            worker.send({ type: "db", data: getUserById(msg.payload.userId) });
          }
          break;
        case "add":
          if (msg.payload.username && msg.payload.age && msg.payload.hobbies) {
            worker.send({
              type: "db",
              data: addUser({
                username: msg.payload.username,
                age: msg.payload.age,
                hobbies: msg.payload.hobbies,
              }),
            });
          }
          break;
        case "update":
          if (msg.payload.userId) {
            const { userId, ...rest } = msg.payload;
            worker.send({
              type: "db",
              data: updateUser(userId, { ...rest }),
            });
          }
          break;
        case "delete":
          if (msg.payload.userId) {
            worker.send({ type: "db", data: deleteUser(msg.payload.userId) });
          }
          break;
        default:
          break;
      }
    });
  }

  const mainServer = http.createServer((req, res) => {
    const targetPort = workerPorts[current];
    current = (current + 1) % workerPorts.length;

    const proxy = http.request(
      {
        hostname: "localhost",
        port: targetPort,
        path: req.url,
        method: req.method,
        headers: req.headers,
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode ?? 200, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
      }
    );

    req.pipe(proxy, { end: true });

    proxy.on("error", (err) => {
      res.writeHead(502);
      res.end(`Proxy error: ${err.message}`);
    });
  });

  mainServer.listen(PORT, () => {
    console.log(`Load balancer listening on port ${PORT}`);
  });
} else {
  server.listen(PORT, () => {
    console.log(`Worker ${process.pid} listening on port ${PORT}`);
  });
}
