import type { Response } from "express";
import { removeJWT } from "./AccessToken.js";
import { removeRefreshToken } from "./RefreshToken.js";

export const cleanAuthCookies = (res: Response) => {
  removeJWT(res);
  removeRefreshToken(res);
};
