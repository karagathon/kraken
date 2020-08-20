import express from "express";
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
import cors from "cors";
import bodyParser from "body-parser";
import { formatReport, guid } from "./helpers";
var path = require("path");

require("dotenv").config();

io.set("origins", "*:*");

let port = process.env.PORT || 7000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("client"));
http.listen(port);

var collections = {};
var nodeList = [];

console.log(`===============================`);
console.log(`Kraken Demo API: ${port}`);
console.log(`===============================`);

const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("db.json");

export const db = low(adapter);

// host landing page
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/index.html"));
});

// get status
app.get("/status", (req, res) => {
  res.send({
    message: "Kraken Demo API v.0",
    status: "running",
    total_nodes: nodeList.length,
    total_collections: Object.keys(collections).length,
  });
});

// get all events
app.get("/events", (req, res) => {
  let allEvents = db.get("events").value();

  res.send(allEvents);
});

// broadcast network feed in small chunks
app.get("/network/feed", (req, res) => {
  console.log("accessing feed...");
  let data = db.get("advisories").value();
  res.send(data);
});

// recieve raw reports
app.post("/report", (req, res) => {
  let payload = req.body.data;

  if (payload) {
    var parseData = payload.replace(/"{/gi, "{").replace(/}"/gi, "}");
    try {
      let reportData = JSON.parse(parseData);
      let formattedReport = formatReport(reportData);

      // save report to event collection
      db.get("events").value().push(formattedReport);

      // record interaction with device.
      let deviceID = reportData.payload
        ? reportData.payload.uid
        : reportData.device_id;

      let deviceInstance = db
        .get("devices")
        .find({ device_id: deviceID })
        .value();

      if (!deviceInstance) {
        let newDevice = {
          id: guid(),
          device_id: deviceID,
          first_interaction: Date.now(),
          last_interaction: Date.now(),
        };
        db.get("devices").value().push(newDevice);
      } else {
        deviceInstance.last_interaction = Date.now();
      }

      db.write();

      let updatedRecords = db.get("events").value();
      // broadcast updated report records
      io.emit("feedUpdate", { data: updatedRecords });

      res.json({ status: 200, message: "Kraken: Raw report recieved." });
    } catch (err) {
      console.log(err);
      res.status(400).json({
        message:
          "Error : Malformed Request, check the payload format and try again.",
      });
    }
  } else {
    res.status(400).json({ message: "Error : Incomplete Data Provided" });
  }
});

// Handle Socket Events
io.sockets.on("connection", function (socket: any) {
  // for initilisation of a node
});
