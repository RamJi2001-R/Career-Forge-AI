import mongoose from "mongoose";

// Har baar jab user resume upload karega, ek record yahan save hoga.
// Isse hum "resume history" bhi bana payenge (Profile page ke liye).
const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // ye batata hai ki ye resume kis user ka hai
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    extractedText: {
      type: String, // resume se nikala gaya plain text, AI ko yahi bhejenge
      required: true,
    },
  },
  { timestamps: true }
);

const Resume = mongoose.model("Resume", resumeSchema);

export default Resume;
