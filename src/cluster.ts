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
    const worker = cluster.fork({ PORT: port, CLUSTER_MODE: true });
    workerPorts.push(port);

    worker.on("message", (msg) => {
      if (msg.type === "getAll") {
        worker.send({ type: "db", data: getUsers() });
      }

      if (msg.type === "getById") {
        worker.send({ type: "db", data: getUserById(msg.payload) });
      }

      if (msg.type === "add") {
        worker.send({ type: "db", data: addUser(msg.payload) });
      }
      if (msg.type === "update") {
        const { id, ...rest } = msg.payload;
        worker.send({
          type: "ok",
          data: updateUser(id, { ...rest }),
        });
      }
      if (msg.type === "delete") {
        worker.send({ type: "ok", data: deleteUser(msg.payload) });
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
