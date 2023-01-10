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

const filesRouter = express.Router();

filesRouter.post("/blogPosts/:id", multer().single("cover"), async (req, res, next) => {
  try {
    const originalFileExtension = extname(req.file.originalname);
    const fileName = req.params.id + originalFileExtension;

    await saveBlogPostsCovers(fileName, req.file.buffer);

    const url = `http://localhost:3003/img/blogPosts/${fileName}`;

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
