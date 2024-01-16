const { MongoClient, ObjectId } = require("mongodb");
// const MongoClient = mongodb.MongoClient;

const connectionUrl = "mongodb://127.0.0.1:27017";
const databaseName = "task-manager";

// const id = new ObjectId();
// console.log(id);
// console.log(id.getTimestamp());

// client integration
MongoClient.connect(connectionUrl, {
  useNewUrlParser: true,
})
  .then((client) => {
    console.log("connected");

    //   Calling db
    const db = client.db(databaseName);

    //   making and inserting document into collection
    // db.collection("users")
    //   .insertOne({
    //     name: "someone",
    //     age: 32,
    //   })
    //   .then((result) => {
    //     console.log(result);
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });

    //   Insert many documents
    // db.collection("users")
    //   .insertMany([
    //     {
    //       name: "some 1",
    //       age: 2,
    //     },
    //     {
    //       name: "no one",
    //       age: 34,
    //     },
    //   ])
    //   .then((result) => {
    //     console.log(result);
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });

    //   querying documents
    // db.collection("users")
    //   .findOne({ name: "abhi" })
    //   .then((result) => {
    //     console.log(result);
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });

    // const cursor = db.collection("users").find();
    // console.log(cursor);
    // cursor
    //   .toArray()
    //   .then((result) => {
    //     console.log(result);
    //   })
    //   .catch((err) => console.log(err));

    // db.collection("users")
    //   .updateOne(
    //     { name: "no one" },
    //     {
    //       $set: {
    //         name: "ok one",
    //       },
    //     }
    //   )
    //   .then((result) => {
    //     console.log(result);
    //   })
    //   .catch((err) => console.log(err));

    // db.collection("users")
    //   .updateMany(
    //     { name: "ok one" },
    //     {
    //       $inc: {
    //         count: 2,
    //       },
    //     },
    //     {
    //       $upsert: true,
    //     }
    //   )
    //   .then((result) => {
    //     console.log(result);
    //   })
    //   .catch((err) => console.log(err));

    // db.collection("users")
    //   .deleteOne({ age: 2 })
    //   .then((result) => {
    //     console.log(result);
    //   })
    //   .catch((err) => console.log(err));
  })
  .catch((err) => {
    console.log(err);
  });
