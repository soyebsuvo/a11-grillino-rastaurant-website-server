const express = require("express");
const cors = require("cors");
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000; 
const { MongoClient, ServerApiVersion } = require("mongodb");

// middlewares
app.use(cors());
app.use(express.json());


const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.awacgo4.mongodb.net/?retryWrites=true&w=majority`;
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
    const database = client.db('foodDB');
    const foodsCollection = database.collection('foods');

    app.get('/foods' , async ( req , res) => {
        const result = await foodsCollection.find().toArray();
        res.send(result);
    })
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
