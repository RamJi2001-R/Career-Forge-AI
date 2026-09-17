import api from "../api/axios.js";

// PDF ko blob ke roop me fetch karke browser me download trigger karta hai.
// Simple <a href> isliye kaam nahi karta kyunki humein JWT token
// Authorization header me bhejna padta hai - jo <a> tag nahi kar sakta.
export const downloadPdf = async (url, fileName) => {
  const res = await api.get(url, { responseType: "blob" });

  const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = blobUrl;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl); // cleanup, memory leak se bachne ke liye
};
