import express from "express";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import uniqid from "uniqid";
import { checkPostSchema, triggerBadRequest } from "./validator.js";

import httpErrors from "http-errors";
import createHttpError from "http-errors";

const { NotFound, BadRequest } = httpErrors;

const postsRouter = express.Router();
const postsJSONPath = join(dirname(fileURLToPath(import.meta.url)), "blogPosts.json");

// 1. POST: http://localhost:3001/blogPosts/
postsRouter.post("/", checkPostSchema, triggerBadRequest, (req, res, next) => {
  console.log("Request BODY: ", req.body);

  try {
    const post = {
      ...req.body,
      // category: "ARTICLE CATEGORY",
      // title: "ARTICLE TITLE",
      // cover: "ARTICLE COVER (IMAGE LINK)",
      // readTime: {
      //   value: `${req.body.readTime.vlue}`,
      //   unit: `${req.body.readTime.unit}`,
      //},
      author: {
        //   name: `${req.body.author.name}`,
        avatar: `https://ui-avatars.com/api/?name=${req.body.author.name}`,
      },
      // content: `${req.body.content}`,
      createdAt: new Date(),
      id: uniqid(),
    };

    console.log("The post is: ", post);
    const postsList = JSON.parse(fs.readFileSync(postsJSONPath));
    postsList.push(post);

    fs.writeFileSync(postsJSONPath, JSON.stringify(postsList));

    res.status(201).send({ message: `Post: '${post.title}' has been created by ${req.body.author.name}`, id: post.id });
  } catch (error) {
    next(error);
  }
});

// 2. GET ALL Blog Posts: http://localhost:3001/blogPosts/
postsRouter.get("/", (req, res, next) => {
  const content = fs.readFileSync(postsJSONPath);
  const postsList = JSON.parse(content);
  try {
    if (req.query && req.query.category) {
      const filteredPosts = postsList.filter(
        (post) => post.category.toLowerCase() === req.query.category.toLowerCase()
      );
      res.send(filteredPosts);
    } else {
      res.send(postsList);
    }
  } catch (error) {
    next(error);
  }
});

// 3. GET SINGLE Blog Post: http://localhost:3001/authors/:blogPostId
postsRouter.get("/:blogPostId", (req, res, next) => {
  try {
    const blogPostId = req.params.blogPostId;

    const postsList = JSON.parse(fs.readFileSync(postsJSONPath));

    const post = postsList.find((post) => post.id === blogPostId);

    if (post) {
      res.send(post);
    } else {
      // next(createHttpError(404, `The post with id: ${blogPostId} is not in the archive`));
      next(NotFound(`The post with id: ${blogPostId} is not in the archive`));
    }
  } catch (error) {
    next(error);
  }
});

// 4. UPDATE SINGLE Blog Post: http://localhost:3001/authors/:blogPostId
postsRouter.put("/:blogPostId", (req, res) => {
  const { blogPostId } = req.params;

  const postsList = JSON.parse(fs.readFileSync(postsJSONPath));

  const index = postsList.findIndex((post) => post.id === blogPostId);
  const oldPost = postsList[index];
  const updatePost = { ...oldPost, ...req.body, updatedAt: new Date() };
  postsList[index] = updatePost;

  console.log("Updated post: ", updatePost);

  fs.writeFileSync(postsJSONPath, JSON.stringify(postsList));
  res.send(updatePost);
});

// 5. DELETE SINGLE AUTHOR: http://localhost:3001/authors/:blogPostId
postsRouter.delete("/:blogPostId", (req, res) => {
  const postsList = JSON.parse(fs.readFileSync(postsJSONPath));

  const remainingPosts = postsList.filter((post) => post.id !== req.params.blogPostId);

  fs.writeFileSync(postsJSONPath, JSON.stringify(remainingPosts));
  res.send({ message: `Post deleted successfully` });
});

export default postsRouter;
