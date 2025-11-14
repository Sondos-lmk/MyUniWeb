import { Event } from "../models/Events/Event.js"; 
import { Student } from "../models/Users/Student.js";
import { Staff } from "../models/Users/Staff.js";
import { TA } from "../models/Users/TA.js";
import { Professor } from "../models/Users/Professor.js";
import { sendEmail } from "./email.js";
import { generateCertificate } from "./generateCertificate.js";

export const sendCertificatesForCompletedWorkshops = async () => {
  try {
    const now = new Date();

    // 1️⃣ Find all workshops that ended but not marked as "certificatesSent"
    const workshops = await Event.find({
      type: "workshop",
      endDate: { $lte: now },
      certificatesSent: { $ne: true },
    });

    if (!workshops.length) return; 

    for (const workshop of workshops) {
      console.log(`📨 Sending certificates for: ${workshop.title}`);

      // 2️⃣ Find all users (Student, Staff, TA, Professor) who registered and paid for this workshop
      const userModels = [Student, Staff, TA, Professor];
      let attendees = [];

      for (const UserModel of userModels) {
        const users = await UserModel.find({
          "registeredEvents.event": workshop._id,
          "registeredEvents.paymentStatus": "paid"
        }).select("name email registeredEvents");

        attendees = attendees.concat(users);
      }

      if (!attendees.length) {
        console.log(`⚠️ No paid attendees for workshop: ${workshop.title}`);
        // Mark as sent and completed even if no attendees to avoid reprocessing
        workshop.certificatesSent = true;
        workshop.status = "completed";
        await workshop.save();
        continue;
      }

      // 3️⃣ Send certificate to each paid attendee
      for (const user of attendees) {
        try {
          // Generate certificate PDF
          const filePath = await generateCertificate(
            user.name,
            workshop.title,
            workshop.endDate.toDateString()
          );

          // Send email with certificate attachment
          await sendEmail({
            to: user.email,
            subject: `Certificate of Attendance - ${workshop.title}`,
            html: `
              <p>Dear ${user.name},</p>
              <p>Congratulations! 🎓 You have successfully attended <strong>${workshop.title}</strong>.</p>
              <p>Your certificate of attendance is attached below.</p>
              <p>Best regards,<br/>Innovex Team</p>
            `,
            attachments: [
              {
                filename: `${workshop.title}_Certificate.pdf`,
                path: filePath,
              },
            ],
          });

          console.log(`✅ Certificate sent to ${user.name} (${user.email})`);
        } catch (emailError) {
          console.error(`❌ Failed to send certificate to ${user.email}:`, emailError);
        }
      }

      // 4️⃣ Mark this workshop as completed and certificates sent
      workshop.certificatesSent = true;
      workshop.status = "completed";
      await workshop.save();
      console.log(`✅ Completed certificates for: ${workshop.title}`);
    }

    console.log("✅ All certificates sent successfully.");
  } catch (error) {
    console.error("❌ Certificate scheduler error:", error);
  }
};
