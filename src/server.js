import express from "express";
import authorsRouter from "./api/authors/index.js";
import postsRouter from "./api/blogPosts/index.js";
import filesRouter from "./api/files/index.js";
import listEndpoints from "express-list-endpoints";
import createHttpError from "http-errors";

const { NotFound } = createHttpError;

import { join } from "path";

import { badRequestHandler, notFoundHandler, serverErrorHandler } from "./errorHandler.js";

import cors from "cors";

const server = express();

const port = process.env.PORT;

const whiteList = [process.env.FE_DEV_URL, process.env.FE_PROD_URL];

const corsOptions = {
  origin: (origin, corsNext) => {
    console.log("CURRENT ORIGIN", origin);
    if (!origin || whiteList.indexOf(origin) !== -1) {
      corsNext(null, true);
    } else {
      corsNext(NotFound(`Origin ${origin} is not in the whitelist`));
    }
  },
};

const publicFolderPath = join(process.cwd(), "./public");

server.use(express.static(publicFolderPath));
// server.use(cors(corsOptions)); //
server.use(cors()); //
server.use(express.json());

/*-----------ENDPOINTS-------------*/
server.use("/authors", authorsRouter);
server.use("/blogPosts", postsRouter);
server.use("/files", filesRouter);

/*-----------ERROR HANDLERS-------------*/
server.use(badRequestHandler);
server.use(notFoundHandler);
server.use(serverErrorHandler);

server.listen(port, () => {
  console.table(listEndpoints(server));
  console.log("Our server is running on port: ", port);
});
