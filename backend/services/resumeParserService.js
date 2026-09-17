import pdfParse from "pdf-parse";
import mammoth from "mammoth";

// Ye function file ka buffer (raw data) aur mimetype leta hai,
// aur usme se plain text nikal ke return karta hai.
export const extractTextFromResume = async (fileBuffer, mimeType) => {
  if (mimeType === "application/pdf") {
    const data = await pdfParse(fileBuffer);
    return data.text;
  }

  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value;
  }

  throw new Error("Unsupported file type");
};
