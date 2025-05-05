import { NextFunction, Request, Response } from "express";
import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from "./tokenServices.js";
import { accessTokenSecret, refreshTokenSecret } from "./main.js";

const setSession = (req: Request, payload: Record<string, unknown>) => {
  const { id, companyId } = payload as Record<string, unknown>;

  req.user = id;
  req.companyId = companyId as number;
}

export default function jwtAuth (req: Request, res: Response, next: NextFunction) {
  const { accessToken, refreshToken } = req.cookies;

  if (refreshToken == null) {
    res.status(401).json({ msg: "Unauthorized, login is necessary" });
    return;
  }

  if (accessToken) {
    try {
      const payload = verifyAccessToken(accessToken, accessTokenSecret);   

      setSession(req, payload as Record<string, unknown>);
      next();
      return;
    } catch {}
  }

  try {
    const payload = verifyRefreshToken(refreshToken, refreshTokenSecret);
    delete (payload as Record<string, unknown>).exp;

    const newAccessToken = generateAccessToken(payload, accessTokenSecret);
    const newRefreshToken = generateRefreshToken(payload, refreshTokenSecret);
    const rememberMePayload = (payload as Record<string, unknown>).rememberMe;
    const rememberMe = rememberMePayload === true || rememberMePayload === "true";


    res.cookie("accessToken", newAccessToken, { 
      httpOnly: true, 
      secure: true, 
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    if (rememberMe) {
      res.cookie("refreshToken", newRefreshToken, { 
        httpOnly: true, 
        secure: true, 
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      }); 
    }

    setSession(req, payload as Record<string, unknown>);
    next();
  } catch(e) {
    console.log(e);
    res.status(401).json({ msg: "Unauthorized, login is necessary" });
  }
}
