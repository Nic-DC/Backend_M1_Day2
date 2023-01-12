import express from "express";
import multer from "multer";
import { extname } from "path";
import {
  saveBlogPostsCovers,
  saveAuthorsAvatars,
  getBlogPosts,
  writeBlogPosts,
  getAuthorsList,
  writeAuthorsList,
  getPostsJSONReadableStream,
} from "../../lib/fs-tools.js";

import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

import { getPdfReadableStream } from "../../lib/pdf-tools.js";
import { pipeline } from "stream";

import json2csv from "json2csv";

const filesRouter = express.Router();

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "m1-week2/blogs",
    },
  }),
}).single("cover");

filesRouter.post("/blogPosts/:id", cloudinaryUploader, async (req, res, next) => {
  try {
    // const originalFileExtension = extname(req.file.originalname);
    // const fileName = req.params.id + originalFileExtension;

    // await saveBlogPostsCovers(fileName, req.file.buffer);

    // const url = `https://backendm1day2-production.up.railway.app/img/blogPosts/${fileName}`;

    console.log("the req.file is: ", req.file);
    const url = req.file.path;

    const blogPosts = await getBlogPosts();

    const index = blogPosts.findIndex((post) => post._id === req.params.id);

    if (index !== -1) {
      const oldPost = blogPosts[index];

      const cover = url;
      const updatedPost = { ...oldPost, cover, updatedAt: new Date() };

      blogPosts[index] = updatedPost;

      await writeBlogPosts(blogPosts);
    }
    res.send("Cover is uploaded");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

filesRouter.post("/authors/:id", multer().single("avatar"), async (req, res, next) => {
  try {
    const originalFileExtension = extname(fileName, req.file.buffer);
    const fileName = req.params.id + originalFileExtension;

    await saveAuthorsAvatars(fileName, req.file.buffer);

    const url = `http://localhost:3003/img/authors/${fileName}`;

    const authorsList = await getAuthorsList();

    const index = authorsList.findIndex((author) => author._id === req.params.id);

    if (index !== -1) {
      const oldAuthor = authorsList[index];

      const avatar = url;

      const updatedAuthor = { ...oldAuthor, avatar, updatedAt: new Date() };

      authorsList[index] = updatedAuthor;

      writeAuthorsList(authorsList);
    } else {
      res.send("Author avatar is uploaded");
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// CREATE PDF
filesRouter.get("/:id/pdf", async (req, res, next) => {
  const { id } = req.params;
  const posts = await getBlogPosts();
  console.log("posts", posts);

  const selectedPost = posts.find((post) => post._id === id);
  console.log("selectedPost", selectedPost);

  if (selectedPost !== null) {
    res.setHeader("Content-Disposition", "attachment; blogPost.pdf");

    const source = getPdfReadableStream(selectedPost);
    const destination = res;

    pipeline(source, destination, (err) => {
      if (err) console.log(err);
    });
  } else {
    console.log(`There is no blog post with this id: ${id}`);
  }
});

//
filesRouter.get("/postsCSV", (req, res, next) => {
  try {
    res.setHeader("Content-Disposition", "attachment; filename=posts.csv");

    const source = getPostsJSONReadableStream();
    const transform = new json2csv.Transform({ fields: ["category", "title", "content"] });
    const destination = res;

    pipeline(source, transform, destination, (err) => {
      if (err) console.log(err);
    });
  } catch (error) {
    next(error);
  }
});

export default filesRouter;
