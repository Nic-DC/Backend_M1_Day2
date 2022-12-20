import express from "express";
import authorsRouter from "./api/authors/index.js";
import listEndpoints from "express-list-endpoints";

const server = express();

const port = 3001;

server.use(express.json());

/*-----------ENDPOINTS-------------*/
server.use("/authors", authorsRouter);

server.listen(port, () => {
  console.table(listEndpoints(server));
  console.log("Our server is running on port: ", port);
});
