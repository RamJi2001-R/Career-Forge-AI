import multer from "multer";

// Hum file ko disk pe save nahi kar rahe (memory me hi rakhenge),
// kyunki humein sirf usse text nikal ke turant discard karna hai.
const storage = multer.memoryStorage();

// File type check karo - sirf PDF aur DOCX allow karo
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and DOCX files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

export default upload;
