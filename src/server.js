import express from "express";
import authorsRouter from "./api/authors/index.js";
import postsRouter from "./api/blogPosts/index.js";
import listEndpoints from "express-list-endpoints";

import { notFoundHandler, serverErrorHandler } from "./errorHandler.js";

import cors from "cors";

const server = express();

const port = 3001;
server.use(cors()); // Just to let FE communicate with BE successfully
server.use(express.json());

/*-----------ENDPOINTS-------------*/
server.use("/authors", authorsRouter);
server.use("/blogPosts", postsRouter);

server.use(notFoundHandler);
server.use(serverErrorHandler);

server.listen(port, () => {
  console.table(listEndpoints(server));
  console.log("Our server is running on port: ", port);
});
