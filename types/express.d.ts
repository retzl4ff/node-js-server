import { JwtPayload } from "jsonwebtoken";

declare global {
    namespace Express {
      interface Request {
        user?: number | JwtPayload;
        companyId: number;
      }
    }
  }
  