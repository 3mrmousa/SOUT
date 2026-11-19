import type { Response, Request, NextFunction } from "express";

type AsyncRequestHandler<TReq extends Request = Request> = (
  req: TReq,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

function asyncHandler<TReq extends Request = Request>(
  fn: AsyncRequestHandler<TReq>,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req as TReq, res, next)).catch(next);
  };
}

export default asyncHandler;
