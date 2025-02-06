import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const dbURI = `${process.env.MONGODB_URI}/${DB_NAME}?retryWrites=true&w=majority`;
    const connectionInstance = await mongoose.connect(dbURI);

    console.log(`MongoDB connected: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1); // Exit with failure status
  }
};

export default connectDB;
