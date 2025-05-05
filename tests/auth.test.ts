import { expect, use } from "chai";
import { mockCredentials } from "../src/main.js";
import request from "supertest";
import app from "../src/main.js";

describe("API Routes", () => {
  describe("GET /", () => {
    it("should return an error message", async () => {
      const res = await request(app).get("/");
      expect(res.status).to.equal(401);
      expect(res.body).to.deep.equal({
        msg: "Unauthorized, login is necessary",
      });
    });
  });

  describe("Register a new user and try to get his data", () => {
    it("should register a new user successfully and get his username and company", async () => {
      const res = await request(app).post("/register").send({
        username: "new user",
        password: "new password",
        companyId: 1,
        rememberMe: 1,
      });

      const cookies = res.headers["set-cookie"];
      const refreshToken = cookies[0];

      expect(res.body).to.deep.equal({ msg: "Welcome new user!" });
      expect(cookies).to.be.an("array");
      expect(refreshToken).to.include("refreshToken=");

      const userInfo = await request(app)
        .get("/userInfo")
        .set("Cookie", refreshToken);

      expect(userInfo.body).to.deep.equal({
        username: "new user",
        companyId: 1,
      });
    });

    it("should return an error for already used username", async () => {
      const res = await request(app).post("/register").send({
        username: "new user",
        password: "new password",
        companyId: 1,
        rememberMe: 1,
      });

      expect(res.body).to.deep.equal({ msg: "Username has already been used" });
    });
  });

  describe("POST /login", () => {
    it("should login successfully with valid credentials", async () => {
      const res = await request(app).post("/login").send({
        username: "new user",
        password: "new password",
        rememberMe: 1,
      });

      const cookies = res.headers["set-cookie"];
      const refreshToken = cookies[0];

      expect(res.body).to.deep.equal({ msg: "Welcome new user!" });
      expect(cookies).to.be.an("array");
      expect(refreshToken).to.include("refreshToken=");

      const homeRoute = await request(app).get("/").set("Cookie", refreshToken);

      expect(homeRoute.body).to.deep.equal({ msg: "Welcome Home!" });
    });

    it("should return 401 for invalid credentials", async () => {
      const res = await request(app).post("/login").send({
        username: "new invalid user",
        password: "new invalid password",
        rememberMe: 1,
      });

      expect(res.status).to.equal(401);
      expect(res.body).to.deep.equal({
        msg: "Username or Password is incorrect",
      });
    });
  });

  describe("POST /logout", () => {
    it("should logout successfully", async () => {
      const res = await request(app).post("/logout");

      expect(res.body).to.deep.equal({
        msg: "User has logged out succesfully",
      });

      expect(res.headers["set-cookie"]).to.satisfy((cookies: string[]) => {
        return cookies.some(
          (cookie) =>
            cookie.includes("accessToken=;") ||
            cookie.includes("refreshToken=;")
        );
      });
    });
  });
});
