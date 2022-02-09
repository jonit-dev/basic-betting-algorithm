import "reflect-metadata"; //! THIS IMPORT MUST ALWAYS COME FIRST. BEWARE VSCODE AUTO IMPORT SORT!!!
import { Bet } from "@providers/bet/Bet";
import cors from "cors";
import "dotenv/config";
import express from "express";
import "express-async-errors";
import { getRouteInfo, InversifyExpressServer } from "inversify-express-utils";
import morgan from "morgan";
import * as prettyjson from "prettyjson";
import { container, serverHelper } from "./providers/inversify/container";
import { errorHandlerMiddleware } from "./providers/middlewares/ErrorHandlerMiddleware";

const port = process.env.PORT || 5000;

const server = new InversifyExpressServer(container);

server.setConfig((app) => {
  // Middlewares ========================================
  app.use(cors());
  app.use(express.json());
  app.use(morgan("dev"));
  app.use(express.static("public"));

  serverHelper.showBootstrapMessage({ env: process.env.ENV, port: Number(port) });

  const newBet = new Bet(["Team A", "Team B"]);
  newBet.placeBet({
    address: "0x0000001",
    team: "Team A",
    value: 1,
  });

  newBet.placeBet({
    address: "0x0000002",
    team: "Team B",
    value: 0.5,
  });
  newBet.placeBet({
    address: "0x0000003",
    team: "Team A",
    value: 1.5,
  });
  newBet.placeBet({
    address: "0x0000004",
    team: "Team B",
    value: 3,
  });
  newBet.placeBet({
    address: "0x0000005",
    team: "Team B",
    value: 2,
  });
  newBet.placeBet({
    address: "0x0000006",
    team: "Team A",
    value: 7,
  });
  newBet.placeBet({
    address: "0x0000007",
    team: "Team B",
    value: 1.5,
  });
  newBet.placeBet({
    address: "0x0000008",
    team: "Team B",
    value: 0.25,
  });
  newBet.placeBet({
    address: "0x0000009",
    team: "Team A",
    value: 1,
  });
  newBet.placeBet({
    address: "0x0000010",
    team: "Team B",
    value: 0.5,
  });
  newBet.placeBet({
    address: "0x0000011",
    team: "Team A",
    value: 4,
  });

  newBet.pickWinner("Team B");
});

const app = server.build();
app.listen(port);

if (process.argv.includes("--show-routes")) {
  const routeInfo = getRouteInfo(container);
  console.log(prettyjson.render({ routes: routeInfo }));
}

app.use(errorHandlerMiddleware); //! This must come last, otherwise it fails to catch errors thrown
