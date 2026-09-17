import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Schema = MongoDB me ek "user" document kaisa dikhega, uska blueprint
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // do users same email se register nahi kar sakte
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // by default query karne par password wapas nahi aayega
    },
  },
  {
    timestamps: true, // createdAt aur updatedAt fields apne aap add ho jayengi
  }
);

// Ye ek "pre-save hook" hai — user save hone se PEHLE ye chalega.
// Isका kaam: plain password ko hash (encrypt) karna, taaki DB me
// kabhi bhi asli password save na ho.
userSchema.pre("save", async function (next) {
  // Agar password change nahi hua (jaise sirf naam update ho raha hai),
  // to dobara hash mat karo.
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Ye ek custom method hai jo hum User document par call kar payenge,
// jaise: user.comparePassword("12345")
// Login ke time entered password ko DB wale hashed password se compare karta hai.
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
