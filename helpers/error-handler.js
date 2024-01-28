function errorHandler(err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    return res.json({
      status: false,
      message: "The User is not Authorized",
      data: null,
    });
  }
  if (err.name == "ValidationError") {
    return res.json({ status: false, message: err.message, data: null });
  }
  return res.status(401).json({
    status: false,
    message: err.message,
    data: null,
  });
}
module.exports = errorHandler;
