import express from "express";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import uniqid from "uniqid";

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

// 1. POST: http://localhost:3001/authors/
authorsRouter.post("/", (req, res) => {
  console.log("Request BODY: ", req.body);

  const author = {
    ...req.body,
    email: `${req.body.name.toLowerCase()}.${req.body.surname.toLowerCase()}@email.com`,
    avatar: `https://ui-avatars.com/api/?name=${req.body.name}+${req.body.surname}`,
    createdAt: new Date(),
    id: uniqid(),
  };
  console.log("The author is: ", author);

  const authorsList = JSON.parse(fs.readFileSync(authorJSONPath));

  authorsList.push(author);

  fs.writeFileSync(authorJSONPath, JSON.stringify(authorsList));

  res.status(201).send({ message: `Author: ${author.name} has been created`, id: author.id });
});

// 2. GET: http://localhost:3001/authors/
authorsRouter.get("/", (req, res) => {
  const content = fs.readFileSync(authorJSONPath);
  const authorsList = JSON.parse(content);
  res.send(authorsList);
});

// 3. GET SINGLE AUTHOR: http://localhost:3001/authors/:authorId
authorsRouter.get("/:authorId", (req, res) => {
  const authorId = req.params.authorId;

  const authorsList = JSON.parse(fs.readFileSync(authorJSONPath));

  const author = authorsList.find((author) => author.id === authorId);

  res.send(author);
});

// 4. UPDATE SINGLE AUTHOR: http://localhost:3001/authors/:authorId
authorsRouter.put("/:authorId", (req, res) => {
  const { authorId } = req.params;

  const authorsList = JSON.parse(fs.readFileSync(authorJSONPath));

  const index = authorsList.findIndex((author) => author.id === authorId);
  const oldAuthor = authorsList[index];
  const updateAuthor = { ...oldAuthor, ...req.body, updatedAt: new Date() };
  authorsList[index] = updateAuthor;

  console.log("Updated author: ", updateAuthor);

  fs.writeFileSync(authorJSONPath, JSON.stringify(authorsList));
  res.send(updateAuthor);
});

// 5. DELETE SINGLE AUTHOR: http://localhost:3001/authors/:authorId
authorsRouter.delete("/:authorId", (req, res) => {
  const authorsList = JSON.parse(fs.readFileSync(authorJSONPath));

  const remainingAuthors = authorsList.filter((author) => author.id !== req.params.authorId);

  fs.writeFileSync(authorJSONPath, JSON.stringify(remainingAuthors));
  res.send({ message: `Author deleted successfully` });
});

// 6. POST SINGLE AUTHOR CHECKEMAIL: http://localhost:3001/authors/checkEmail
authorsRouter.put("/checkEmail", (req, res) => {
  const authorsList = JSON.parse(fs.readFileSync(authorJSONPath));

  const remainingAuthors = authorsList.filter((author) => author.id !== req.params.authorId);

  fs.writeFileSync(authorJSONPath, JSON.stringify(remainingAuthors));
  res.send({ message: "Author deleted successfully" });
});

export default authorsRouter;
