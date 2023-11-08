const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
var jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// middlewares
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.awacgo4.mongodb.net/?retryWrites=true&w=majority`;
// const uri =
//      `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@ac-mjxxqiv-shard-00-00.awacgo4.mongodb.net:27017,ac-mjxxqiv-shard-00-01.awacgo4.mongodb.net:27017,ac-mjxxqiv-shard-00-02.awacgo4.mongodb.net:27017/?ssl=true&replicaSet=atlas-rajjt7-shard-0&authSource=admin&retryWrites=true&w=majority`;

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
    await client.connect();
    const database = client.db("foodDB");
    const foodsCollection = database.collection("foods");
    const orderCollection = database.collection("orders");

    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, "secret", { expiresIn: "2h" });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
        })
        .send({ message: "success" });
    });

    app.get("/foods", async (req, res) => {
      const result = await foodsCollection.find().toArray();
      res.send(result);
    });
    app.get("/foodsByPage", async (req, res) => {
      const skip = parseInt(req.query.skip);
      const limit = parseInt(req.query.limit);
      console.log(skip, limit);
      const result = await foodsCollection
        .find()
        .skip(skip * limit)
        .limit(limit)
        .toArray();
      res.send(result);
    });

    app.get("/foodsCount", async (req, res) => {
      const count = await foodsCollection.estimatedDocumentCount();
      res.send({ count });
    });
    app.get("/food/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await foodsCollection.findOne(query);
      res.send(result);
    });

    app.delete("/food/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await foodsCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/foodss", async (req, res) => {
      const email = req.query.email;
      const query = { userEmail: email };
      const result = await foodsCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/orders", async (req, res) => {
      const email = req.query.email;
      const query = { userEmail: email };
      const result = await orderCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await orderCollection.findOne(query);
      res.send(result);
    });

    app.post("/foods", async (req, res) => {
      const body = req.body;
      const result = await foodsCollection.insertOne(body);
      res.send(result);
    });

    app.post("/orders", async (req, res) => {
      const body = req.body;
      const result = await orderCollection.insertOne(body);
      res.send(result);
    });

    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          food_name: body.food_name,
          food_category: body.food_category,
          food_image: body.food_image,
          price: body.price,
          count: body.count,
          quantity: body.quantity,
          made_by: body.userName,
          userEmail: body.userEmail,
          origin: body.origin,
          desc: body.desc,
        },
      };
      const result = await foodsCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    app.patch("/food/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          count: body.count,
        },
      };
      const result = await foodsCollection.updateOne(filter, updatedDoc);
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

app.get("/", (req, res) => {
  res.send("Grillino Restaurant management server is running...");
});

app.listen(port, () => {
  console.log(
    `Grillino Restaurant management server is running on port : ${port}`
  );
});
