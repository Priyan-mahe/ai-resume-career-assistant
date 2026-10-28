const pdfParse = require('pdf-parse');

class PDFService {
  async extractText(buffer) {
    try {
      if (!buffer || buffer.length === 0) {
        throw new Error("Empty file buffer received.");
      }
      const data = await pdfParse(buffer);
      return data.text || '';
    } catch (err) {
      console.error(`[PDF Parsing Error] ${err.message}`);
      // Return plain string fallback if binary parsing fails
      return buffer.toString('utf-8').replace(/[^a-zA-Z0-9\s.,@:\-\/]/g, ' ');
    }
  }
}

module.exports = new PDFService();
