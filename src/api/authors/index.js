import express from "express";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import uniqid from "uniqid";
import { checkPostSchema, triggerBadRequest } from "./validator.js";

import httpErrors from "http-errors";
import createHttpError from "http-errors";

const { NotFound, BadRequest } = httpErrors;

import { getAuthorsList, writeAuthorsList } from "../../lib/fs-tools.js";

const authorsRouter = express.Router();

// Current file url:
console.log("Current file url: ", import.meta.url);

// Current file path:
console.log("Current file path: ", fileURLToPath(import.meta.url));

// Parent folder path:
console.log("Parrent folder path is: ", dirname(fileURLToPath(import.meta.url)));

// Concatenate parent's folder path with "authors.json"
console.log("The TARGET is: ", join(dirname(fileURLToPath(import.meta.url))));

const authorJSONPath = join(dirname(fileURLToPath(import.meta.url)), "authorsList.json");

// 1. POST: http://localhost:3003/authors/
authorsRouter.post("/", checkPostSchema, triggerBadRequest, async (req, res, next) => {
  console.log("Request BODY: ", req.body);

  try {
    const author = {
      ...req.body,
      email: `${req.body.name.toLowerCase()}.${req.body.surname.toLowerCase()}@email.com`,

      avatar: `https://ui-avatars.com/api/?name=${req.body.name}+${req.body.surname}`,

      createdAt: new Date(),
      id: uniqid(),
    };
    console.log("The author is: ", author);
    // const authorsList = JSON.parse(fs.readFileSync(authorJSONPath));
    const authorsList = await getAuthorsList();
    authorsList.push(author);

    // fs.writeFileSync(authorJSONPath, JSON.stringify(authorsList));
    await writeAuthorsList(authorsList);

    res.status(201).send({ message: `Author: ${author.name} has been created`, id: author.id });
  } catch (error) {
    next(error);
  }
});

// 2. GET: http://localhost:3001/authors/
authorsRouter.get("/", async (req, res, next) => {
  // const content = fs.readFileSync(authorJSONPath);
  // const authorsList = JSON.parse(content);
  try {
    const authorsList = await getAuthorsList();
    if (req.query && req.query.category) {
      const filteredAuthors = authorsList.filter(
        (author) => author.category.toLowerCase() === req.query.category.toLocaleLowerCase()
      );
      res.send(filteredAuthors);
    } else {
      res.send(authorsList);
    }
  } catch (error) {
    next(error);
  }
});

// 3. GET SINGLE AUTHOR: http://localhost:3001/authors/:authorId
authorsRouter.get("/:authorId", async (req, res, next) => {
  try {
    const authorId = req.params.authorId;
    // const authorsList = JSON.parse(fs.readFileSync(authorJSONPath));
    const authorsList = await getAuthorsList();
    const author = authorsList.find((author) => author.id === authorId);

    if (author) {
      res.send(author);
    } else {
      next(NotFound(`The author with id: ${authorId} is not in our archive`));
    }
  } catch (error) {
    next(error);
  }
});

// 4. UPDATE SINGLE AUTHOR: http://localhost:3001/authors/:authorId
authorsRouter.put("/:authorId", async (req, res) => {
  try {
    const { authorId } = req.params;

    // const authorsList = JSON.parse(fs.readFileSync(authorJSONPath));
    const authorsList = await getAuthorsList();
    const index = authorsList.findIndex((author) => author.id === authorId);

    if (index !== -1) {
      const oldAuthor = authorsList[index];
      const updateAuthor = { ...oldAuthor, ...req.body, updatedAt: new Date() };
      authorsList[index] = updateAuthor;

      console.log("Updated author: ", updateAuthor);

      // fs.writeFileSync(authorJSONPath, JSON.stringify(authorsList));
      writeAuthorsList(authorsList);
      res.send(updateAuthor);
    } else {
      next(NotFound(`Author with id: ${authorId} is not in our archive`));
    }
  } catch (error) {
    next(error);
  }
});

// 5. DELETE SINGLE AUTHOR: http://localhost:3001/authors/:authorId
authorsRouter.delete("/:authorId", async (req, res) => {
  try {
    // const authorsList = JSON.parse(fs.readFileSync(authorJSONPath));
    const authorsList = getAuthorsList();

    const remainingAuthors = authorsList.filter((author) => author.id !== req.params.authorId);

    if (authorsList.length !== remainingAuthors.length) {
      // fs.writeFileSync(authorJSONPath, JSON.stringify(remainingAuthors));
      writeAuthorsList(authorsList);
      res.send({ message: `Author deleted successfully` });
    } else {
      next(NotFound(`The author with the id: ${req.params.authorId} is not in our archives`));
    }
  } catch (error) {
    next(error);
  }
});

// 6. POST SINGLE AUTHOR CHECKEMAIL: http://localhost:3001/authors/checkEmail
authorsRouter.post("/checkEmail/:email", (req, res) => {
  console.log("Request BODY: ", req.body);

  const authorsList = JSON.parse(fs.readFileSync(authorJSONPath));

  const email = {
    ...req.body,
    isEmailUnique: `${authorsList.find((author) => author.email === req.params.email) ? false : true}`,
  };
  console.log("The email is: ", email);

  res.status(201).send({ message: `The email ${email.isEmailUnique ? "does NOT exist" : "exists"}`, email });
});

export default authorsRouter;
