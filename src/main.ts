import dotenv from "dotenv";

import express, { NextFunction, Request, Response } from "express";

import jwtAuth from "./jwtAuth.js";
import { generateAccessToken, generateRefreshToken } from "./tokenServices.js";
import cookieParser from "cookie-parser";

dotenv.config();

export const mockCredentials = [
  { id: 1, companyId: 10, username: 'jon doe', password: '123456' },
  { id: 2, companyId: 20, username: 'kelly edwards', password: '102030' },
  { id: 3, companyId: 30, username: 'mike william', password: '108080' },
];

const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;
export const accessTokenSecret = ACCESS_TOKEN_SECRET || "access_secret";
export const refreshTokenSecret = REFRESH_TOKEN_SECRET || "refresh_secret";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.get("/", jwtAuth, (req, res) => {
  try {
    res.json({ msg: "Welcome Home!"});
  } catch {
    res.status(500).json({ error: "Something went wrong!" });
  }
});

app.post("/login", (req, res) => {
  try {
    const { username, password, rememberMe } = req.body;

    const mockUser = mockCredentials.find((user) => {
      return user.username === username && user.password === password;
    })

    if (mockUser == null) {
      res.status(401).json({ msg: "Username or Password is wrong" });
      return;
    }

    const payload = { id: mockUser.id, companyId: mockUser.companyId, rememberMe };

    const accessToken = generateAccessToken(payload, accessTokenSecret);
    const refreshToken = generateRefreshToken(payload, refreshTokenSecret, rememberMe);

    res.cookie("refreshToken", refreshToken, { 
      httpOnly: true, 
      secure: true, 
      sameSite: "strict",
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 30 * 60 * 1000
    });

    res.cookie("accessToken", accessToken, { 
      httpOnly: true, 
      secure: true, 
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    req.user = mockUser.id;
    req.companyId = mockUser.companyId;
    res.json({ msg: `Welcome ${username}!`   })
  } catch {
    res.status(500).json({ msg: "Something went wrong!" });
  }
});

app.post("/register", (req, res) => {
  try {
    const { username, password, companyId, rememberMe } = req.body;

    const alreadyUsed = mockCredentials.some((user) => user.username === username);

    if (alreadyUsed) {
      res.status(500).json({ msg: "Username has already been used" });
      return;
    }

    const newId = mockCredentials.length + 1;
    mockCredentials.push({ id: newId, companyId, username, password });

    const payload = { id: newId, companyId, rememberMe };

    const accessToken = generateAccessToken(payload, accessTokenSecret);
    const refreshToken = generateRefreshToken(payload, refreshTokenSecret, rememberMe);

    res.cookie("refreshToken", refreshToken, { 
      httpOnly: true, 
      secure: true, 
      sameSite: "strict",
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 30 * 60 * 1000
    });

    res.cookie("accessToken", accessToken, { 
      httpOnly: true, 
      secure: true, 
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    req.user = newId;
    req.companyId = companyId;
    res.json({ msg: `Welcome ${username}!` })
  } catch {
    res.status(500).json({ msg: "Something went wrong!" });
  }
});

app.post("/logout", (req, res) => {
  try {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
  
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
  
    res.status(200).json({ message: "User has logged out succesfully" });
  } catch {
    res.status(500).json({ error: "Something went wrong!" });
  }
});

app.get("/userInfo", (req, res) => {
  try {
    const userInfo = mockCredentials.find((user) => {
      return user.id === req.user;
    });

    const { username, companyId } = userInfo;

    res.json({ username, companyId });
  } catch {
    res.status(500).json({ msg: "User doesn't exists!" });
  }
})

app.listen(port, () => {
  console.log(`Hi! i am the express server and i'm actually running on port ${port}`)
})