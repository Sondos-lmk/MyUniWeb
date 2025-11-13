import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateCertificate = async (studentName, workshopTitle, date) => {
  const __dirname = path.resolve();
  const certificatePath = path.join(
    __dirname,
    `server/certificates/${studentName}_${workshopTitle}.pdf`
  );

  // Ensure folder exists
  fs.mkdirSync(path.join(__dirname, "server/certificates"), { recursive: true });

  const doc = new PDFDocument({ size: "A4", layout: "landscape" });
  const stream = fs.createWriteStream(certificatePath);
  doc.pipe(stream);

  // 🎓 Design
  doc
    .fontSize(36)
    .fillColor("#0A3D62")
    .text("Certificate of Attendance", { align: "center", underline: true });

  doc.moveDown(2);
  doc.fontSize(20).fillColor("black")
    .text(`This certifies that`, { align: "center" })
    .moveDown(1)
    .font("Helvetica-Bold")
    .fontSize(28)
    .fillColor("#1B1464")
    .text(`${studentName}`, { align: "center" })
    .moveDown(1)
    .font("Helvetica")
    .fontSize(20)
    .fillColor("black")
    .text(`has successfully attended the workshop "${workshopTitle}"`, {
      align: "center",
    })
    .moveDown(2)
    .fontSize(16)
    .text(`Date: ${date}`, { align: "center" })
    .moveDown(2)
    .text("GUC Events Management System", { align: "center" });

  doc.end();

  // Wait until PDF finishes
  return new Promise((resolve, reject) => {
    stream.on("finish", () => resolve(certificatePath));
    stream.on("error", reject);
  });
};
