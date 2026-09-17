import mongoose from "mongoose";

// Ye function MongoDB se connection banata hai.
// server.js ise call karega jab app start hoga.
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Agar DB connect na ho to app ko band kar dete hain,
    // kyunki DB ke bina app kaam hi nahi karega.
    process.exit(1);
  }
};

export default connectDB;
