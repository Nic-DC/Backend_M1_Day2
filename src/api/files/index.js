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
} from "../../lib/fs-tools.js";

import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

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

export default filesRouter;
