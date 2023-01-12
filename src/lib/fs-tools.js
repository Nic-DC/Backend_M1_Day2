import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs-extra";

const { readJSON, writeJSON, writeFile, createReadStream, createWriteStream } = fs;

// the path to the data folder that contains the .json files
const dataFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../data");
console.log("The dataFolderPath is: ", dataFolderPath);

// paths to the public/img/ folders that hold the images for authors and blogPosts
const publicFolderPathAuthors = join(process.cwd(), "./public/img/authors");
const publicFolderPathBlogPosts = join(process.cwd(), "./public/img/blogPosts");

// the path to authorsList.json file
const authorsListJSONPath = join(dataFolderPath, "authorsList.json");
// the path to blogPosts.json file
const blogPostsJSONPath = join(dataFolderPath, "blogPosts.json");

// the function to return the content of authorsList - as a Promise
export const getAuthorsList = () => readJSON(authorsListJSONPath);
// the function to return the content of authorsList after actions have been performed on it - as a Promise
export const writeAuthorsList = (authorsList) => writeJSON(authorsListJSONPath, authorsList);

// the function to return the content of blogPosts as a Promise
export const getBlogPosts = () => readJSON(blogPostsJSONPath);
// the function to return the content of blogPosts after actions have been performed on it - as a Promise
export const writeBlogPosts = (blogPosts) => writeJSON(blogPostsJSONPath, blogPosts);

export const saveAuthorsAvatars = (fileName, contentAsBuffer) =>
  writeFile(join(publicFolderPathAuthors, fileName), contentAsBuffer);
export const saveBlogPostsCovers = (fileName, contentAsBuffer) =>
  writeFile(join(publicFolderPathBlogPosts, fileName), contentAsBuffer);

export const getPostsJSONReadableStream = () => createReadStream(blogPostsJSONPath);
export const getPDFWritableStream = (filename) => createWriteStream(join(dataFolderPath, filename));
