import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import session from "express-session";
import path from "path";
import dotenv from "dotenv";

import { connect } from "./connection";
import calculate from "./utils/generateObject";
import updateAll from "./utils/updateall";
import backFetcher from "./utils/backfetcher";

import errorHandler from "./utils/middlewares/errorhandler.middleware";
import responseHandler from "./utils/middlewares/responder.middleware";
const apiRoutes = require("./routes/api"); // API routes

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const USERNAME = process.env.USERNAME || "kanishk";
const PASSWORD = process.env.PASSWORD || "letmein";

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
  })
);

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));
app.use(express.static(path.join(__dirname, "../public")));


// Authentication middleware
function isAuthenticated(req: any, res: Response, next: NextFunction) {
  if (req.session && req.session.isLoggedIn) {
    return next();
  }
  res.redirect("/login");
}

// Routes
app.use("/api", apiRoutes); // Include API routes

app.get("/login", (req: Request, res: Response) => {
  res.render("login", { title: "Algonauts" });
});

app.post("/login", (req: any, res: Response) => {
  const { username, password } = req.body;
  if (username === USERNAME && password === PASSWORD) {
    req.session.isLoggedIn = true;
    res.redirect("/dashboard");
  } else {
    res
      .status(401)
      .send('Invalid credentials. <a href="/login">Try again</a>.');
  }
});

app.get("/logout", (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("An error occurred while logging out.");
    }
    res.redirect("/login");
  });
});

app.get("/dashboard", isAuthenticated, async (req: Request, res: Response) => {
  const data = await backFetcher("/leaderboard/getuserlist");
  res.render("admin/dashboard", {
    message: undefined,
    data: Array.from(data.values()),
  });
});

app.post("/dashboard", isAuthenticated, async (req: Request, res: Response) => {
  const { name, role, leetcode_username, codeforces_username, codechef_username, cses_username } = req.body;
  const generateObject = await calculate(name, role, [
    { platform: "leetcode", username: leetcode_username },
    { platform: "codeforces", username: codeforces_username },
    { platform: "codechef", username: codechef_username },
    { platform: "cses", username: cses_username },
  ]);
  const result = await backFetcher("/leaderboard/adduser", "PUT", generateObject);

  if (result.success) {
    console.log("Update Successful:", result);
  } else {
    console.error("Error during update:", result.error);
  }
  res.redirect("/dashboard");
});

app.get("/problems", isAuthenticated, async (req: Request, res: Response) => {
  const data = await backFetcher("/problems/getproblems/455");
  res.render("admin/problems", { title: "Problem of Day", data });
});

app.post("/problems", isAuthenticated, async (req: Request, res: Response) => {
  const { name, problemIndex, questionLink, contestId, tags, difficulty, date } = req.body;
  await backFetcher("/problems/addproblem", "POST", {
    name,
    problemIndex,
    contestId,
    questionLink,
    tags: tags.split(","),
    difficulty,
    date,
  });
  res.redirect("/problems");
});

app.get("/members", async (req: Request, res: Response) => {
  const data = await backFetcher("/leaderboard/getuserlist");
  res.render("members", { title: "Algonauts", data });
});

app.get("/", async (req: Request, res: Response) => {
  const data = await backFetcher("/problems/getproblems/450005");
  res.render("index", { title: "Algonauts", data });
});

app.get("/rulebook", (req: Request, res: Response) => {
  res.render("rulebook", { title: "Algonauts" });
});

app.get("/leaderboard", async (req: Request, res: Response) => {
  const obj = await backFetcher("/leaderboard/getuserlist");
  // console.log(obj);
  
  res.render("leaderboard", { title: "Algonauts", obj });
});

app.get("/calendar", (req: Request, res: Response) => {
  res.render("calendar", { title: "Algonauts" });
});

app.get("/updateall", isAuthenticated, async (req: Request, res: Response) => {
  await updateAll();
  res.status(200).send("Update was successful");
});

// Global middlewares
app.use(responseHandler);
app.use(errorHandler);

// Start the server
app.listen(PORT, "0.0.0.0", async () => {
  await connect();
  console.log(`Server is running on http://localhost:${PORT}`);
});
