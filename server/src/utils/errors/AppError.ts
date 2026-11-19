export default class AppError extends Error {
  statusCode: number;
  status: string;
  code?: string | undefined;
  error?: any[];

  constructor(
    message: string,
    statusCode: number,
    code?: string | undefined,
    error?: any[],
  ) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.code = code;
    this.error = error || [];
  }
}
