import api from "../api/axios.js";

// PDF ko blob ke roop me fetch karke browser me download trigger karta hai.
// Simple <a href> isliye kaam nahi karta kyunki humein JWT token
// Authorization header me bhejna padta hai - jo <a> tag nahi kar sakta.
export const downloadPdf = async (url, fileName) => {
  try {
    const res = await api.get(url, { responseType: "blob" });

    if (!res.headers["content-type"]?.includes("application/pdf")) {
      const message = await res.data.text();
      throw new Error(JSON.parse(message).message || "PDF generation failed");
    }

    const blobUrl = window.URL.createObjectURL(res.data);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    if (error.response?.data instanceof Blob) {
      const message = await error.response.data.text();
      try {
        throw new Error(JSON.parse(message).message || "PDF download failed");
      } catch (parseError) {
        if (parseError.message !== "Unexpected end of JSON input") {
          throw parseError;
        }
      }
    }

    throw error;
  }
};
