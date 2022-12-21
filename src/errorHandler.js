export const notFoundHandler = (err, req, res, next) => {
  // 404
  if (err.status === 404) {
    res.status(404).send({ message: err.message });
  } else {
    next(err);
  }
};

export const serverErrorHandler = (err, req, res, next) => {
  console.log("THE ERROR IS FROM ABOVE: ", err);
  res.status(500).send({ message: "An error occured on our side and we'll fix it shortly!" });
};
