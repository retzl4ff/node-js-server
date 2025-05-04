import jwt, { JwtPayload } from "jsonwebtoken";

export function generateAccessToken(payload: JwtPayload | string, secret: string) {
  return jwt.sign(payload, secret, { expiresIn: "15m" });
}
  
export function generateRefreshToken(payload: JwtPayload | string, secret: string, rememberMe?: boolean) {
  return jwt.sign(payload, secret, { expiresIn: rememberMe ? "30d" : "7d" });
}
  
export function verifyAccessToken(token: string, secret: string) {
  return jwt.verify(token, secret);
}
  
export function verifyRefreshToken(token: string, secret: string) {
  return jwt.verify(token, secret);
}