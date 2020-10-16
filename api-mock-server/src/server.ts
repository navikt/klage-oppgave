import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
const port = 3000; // default port to listen

app.get("/oppgaver", (req, res) => {
  res.send(require("../fixtures/oppgaver.json"));
});

// define a route handler for the default home page
app.get("/token", (req, res) => {
  res.send(require("../fixtures/token.txt"));
});

// start the Express server
app.listen(port, () => {
  /*tslint:disable*/
  console.log(`server started at http://localhost:${port}`);
});
