import mongoose from "mongoose";

const uri = process.env.MONGODB_URI || "";
if (!uri) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env"
  );
}


const clientP = mongoose.connect(uri).then(m => m.connection.getClient())


mongoose.connection.on("error", err => {
  console.error(err);
  process.exit(1);
});

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
});

// mongoose
//   .connect(uri)
//   .then(() => {
//     console.log("Connected to MongoDB");
//   })
//   .catch((err) => {
//     console.log("Error connecting to MongoDB: ", err);
//   });

export = clientP;
