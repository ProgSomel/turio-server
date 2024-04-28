const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

//! middleWire
app.use(cors({origin: ["http://localhost:5173",'https://turio-4ebb1.web.app']}));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dzik2b9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const spotsCollection = client.db("turioDB").collection("spots");
    const countriesCollection = client.db("turioDB").collection("countries");

    app.get("/spots", async (req, res) => {
      const sort = req.query.sort;
      const email = req.query.email;
      const countryName = req.query.countryName;

      const query = {};
      if (email) {
        query.userEmail = email;
      }
      if (countryName) {
        query.countryName = countryName;
      }

      const sortOptions = {};
      if (sort === "asc") {
        sortOptions.averageCost = 1;
      } else if (sort === "desc") {
        sortOptions.averageCost = -1;
      }
      const cursor = spotsCollection.find(query).sort(sortOptions);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/spots/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await spotsCollection.findOne(query);
      res.send(result);
    });

    app.post("/spots", async (req, res) => {
      const spots = req.body;
      const result = await spotsCollection.insertOne(spots);
      res.send(result);
    });

    app.put("/spots/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const spot = req.body;
      const options = { upsert: true };

      const updateDoc = {
        $set: {
          imageUrl: spot.imageUrl,
          touristsSpotName: spot.touristsSpotName,
          countryName: spot.countryName,
          location: spot.location,
          shortDescription: spot.shortDescription,
          averageCost: spot.averageCost,
          seasonality: spot.seasonality,
          travelTime: spot.travelTime,
          totalVisitorsPerYear: spot.totalVisitorsPerYear,
          userEmail: spot.userEmail,
          userName: spot.userName,
        },
      };

      const result = await spotsCollection.updateOne(
        filter,
        updateDoc,
        options
      );

      res.send(result);
    });

    app.delete("/spots/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await spotsCollection.deleteOne(query);
      res.send(result);
    });

    //! countries
    app.get("/countries", async (req, res) => {
      const cursor = countriesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", async (req, res) => {
  res.send("Welcome to Turio Server!");
});

app.listen(port, async (req, res) => {
  console.log(`listening on ${port}`);
});
