import { Event } from "../models/Events/Workshop.js"; 
import { Student } from "../models/Users/Student.js";
import { sendEmail } from "./email.js";
import { generateCertificate } from "./generateCertificate.js";

export const sendCertificatesForCompletedWorkshops = async () => {
  try {
    const now = new Date();

    // 1️⃣ Find all workshops that ended but not marked as “certificatesSent”
    const workshops = await Event.find({
      type: "workshop",
      endDate: { $lte: now },
      certificatesSent: { $ne: true },
    }).populate("registeredUsers");

    if (!workshops.length) return console.log("✅ No workshops completed yet.");

    for (const workshop of workshops) {
      console.log(`📨 Sending certificates for: ${workshop.title}`);

      for (const user of workshop.registeredUsers) {
        // Generate and email each certificate
        const filePath = await generateCertificate(
          user.name,
          workshop.title,
          workshop.endDate.toDateString()
        );

        await sendEmail({
          to: user.email,
          subject: `Certificate of Attendance - ${workshop.title}`,
          html: `
            <p>Dear ${user.name},</p>
            <p>Congratulations! 🎓 You have successfully attended <strong>${workshop.title}</strong>.</p>
            <p>Your certificate of attendance is attached below.</p>
            <p>Best regards,<br/>GUC Events Team</p>
          `,
          attachments: [
            {
              filename: `${workshop.title}_Certificate.pdf`,
              path: filePath,
            },
          ],
        });
      }

      // 2️⃣ Mark this workshop so we don't resend
      workshop.certificatesSent = true;
      await workshop.save();
    }

    console.log("✅ All certificates sent successfully.");
  } catch (error) {
    console.error("❌ Certificate scheduler error:", error);
  }
};
