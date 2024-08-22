import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err.name === "UnauthorizedError") {
    next(err);

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
};

export default errorHandler;
