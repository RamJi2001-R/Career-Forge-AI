import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Ye middleware har protected route se pehle chalega.
// Kaam: check karna ki request ke saath valid JWT token hai ya nahi.
const protect = async (req, res, next) => {
  let token;

  // Frontend token ko header me is tarah bhejega:
  // Authorization: Bearer <token>
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Token verify karo — agar tampered ya expired hai to error throw hoga
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Token se user id nikal ke, us user ko DB se fetch karo
      // (password field chhod kar, kyunki hume yahan uski zaroorat nahi)
      req.user = await User.findById(decoded.id).select("-password");

      next(); // sab theek hai, aage route handler ko jaane do
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

export default protect;
