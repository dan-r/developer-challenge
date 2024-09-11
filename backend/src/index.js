import FireFly from "@hyperledger/firefly-sdk";
import bodyparser from "body-parser";
import express from "express";
import airline from "../../solidity/artifacts/contracts/Airline.sol/Airline.json";
import config from "../config.json";

import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server);

const firefly = new FireFly({
  host: config.HOST,
  namespace: config.NAMESPACE,
});

const alFfiName = `AirlineFFI-${config.VERSION}`;
const alApiName = `AirlineApi-${config.VERSION}`;

app.use(bodyparser.json());

// Get all flights
app.get("/api/flights", async (req, res) => {
  let flightIds = await firefly.queryContractAPI(alApiName, "getAllFlightIds", {
    key: config.SIGNING_KEY,
  });

  var flights = [];

  for (const id of flightIds.output.reverse()) {
    flights.push(await firefly.queryContractAPI(alApiName, "getFlight", {
      input: {
        flightId: id
      },
      key: config.SIGNING_KEY,
    }));
  }

  res.send(
    flights
  );
});

// Get flight
app.get("/api/flight/:id", async (req, res) => {
  res.send(
    await firefly.queryContractAPI(alApiName, "getFlight", {
      input: {
        flightId: req.params.id
      },
      key: config.SIGNING_KEY,
    })
  );
});

// Create a flight
app.post("/api/flight", async (req, res) => {
  try {
    const fireflyRes = await firefly.invokeContractAPI(alApiName, "addFlight", {
      input: {
        flightNumber: req.body.flightNumber,
        status: 0,
        origin: req.body.origin,
        destination: req.body.destination,
        departureTime: req.body.departureTime,
        arrivalTime: req.body.arrivalTime,
        planeType: req.body.planeType
      },
      key: config.SIGNING_KEY,
    });
    res.status(202).send({
      id: fireflyRes.id,
    });
  } catch (e) {
    res.status(500).send({
      error: e.message,
    });
  }
});

// Update flight
app.put("/api/flight/:id", async (req, res) => {
  try {
    const fireflyRes = await firefly.invokeContractAPI(alApiName, "updateFlight", {
      input: {
        flightId: req.params.id,
        flightNumber: req.body.flightNumber,
        origin: req.body.origin,
        destination: req.body.destination,
        departureTime: req.body.departureTime,
        arrivalTime: req.body.arrivalTime,
        planeType: req.body.planeType,
        status: req.body.status
      },
      key: config.SIGNING_KEY,
    });
    res.status(202).send({
      id: fireflyRes.id,
    });
  } catch (e) {
    res.status(500).send({
      error: e.message,
    });
  }
});

// Delete a flight
app.delete("/api/flight/:id", async (req, res) => {
  try {
    const fireflyRes = await firefly.invokeContractAPI(alApiName, "deleteFlight", {
      input: {
        flightId: req.params.id
      },
      key: config.SIGNING_KEY,
    });
    res.status(202).send({
      id: fireflyRes.id,
    });
  } catch (e) {
    res.status(500).send({
      error: e.message,
    });
  }
});

async function init() {
  await firefly
    .generateContractInterface({
      name: alFfiName,
      namespace: config.NAMESPACE,
      version: "1.0",
      description: "Deployed airline contract",
      input: {
        abi: airline.abi,
      },
    })
    .then(async (alGeneratedFFI) => {
      if (!alGeneratedFFI) return;
      return await firefly.createContractInterface(alGeneratedFFI, {
        confirm: true,
      });
    })
    .then(async (alContractInterface) => {
      if (!alContractInterface) return;
      return await firefly.createContractAPI(
        {
          interface: {
            id: alContractInterface.id,
          },
          location: {
            address: config.AIRLINE_ADDRESS,
          },
          name: alApiName,
        },
        { confirm: true }
      );
    })
    .catch((e) => {
      const err = JSON.parse(JSON.stringify(e.originalError));

      if (err.status === 409) {
        console.log("'AirlineFFI' already exists in FireFly. Ignoring.");
      } else {
        return;
      }
    });

  await firefly
    .createContractAPIListener(alApiName, "FlightChanged", {
      topic: "changed",
    })
    .catch((e) => {
      const err = JSON.parse(JSON.stringify(e.originalError));

      if (err.status === 409) {
        console.log(
          "Flight 'changed' event listener already exists in FireFly. Ignoring."
        );
      } else {
        console.log(
          `Error creating listener for flight "changed" event: ${err.message}`
        );
      }
    });

  await firefly
    .createContractAPIListener(alApiName, "FlightAdded", {
      topic: "added",
    })
    .catch((e) => {
      const err = JSON.parse(JSON.stringify(e.originalError));

      if (err.status === 409) {
        console.log(
          "Flight 'added' event listener already exists in FireFly. Ignoring."
        );
      } else {
        console.log(
          `Error creating listener for flight "added" event: ${err.message}`
        );
      }
    });

  firefly.listen(
    {
      filter: {
        events: "blockchain_event_received",
      },
    },
    async (socket, event) => {
      console.log(
        `${event.blockchainEvent?.info.signature}: ${JSON.stringify(
          event.blockchainEvent?.output,
          null,
          2
        )}`
      );
      io.emit("blockchainEvent", { "name": event.blockchainEvent.name, "data": event.blockchainEvent.output });
    }
  );

  // Start listening
  server.listen(config.PORT, () =>
    console.log(`Kaleido DApp backend listening on port ${config.PORT}!`)
  );
}

io.on("connection", (socket) => {
  console.log("WS: Connect");

  socket.on("disconnect", () => {
    console.log("WS: Disconnect");
  });
});

init().catch((err) => {
  console.error(err.stack);
  process.exit(1);
});

module.exports = {
  app,
};
