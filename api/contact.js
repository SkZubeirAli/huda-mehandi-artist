import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { name, phone, message, email, event, date, address } = req.body;

    if (!name || !phone || !message) {
      return res.status(400).json({ error: "Missing fields" });
    }

    await resend.emails.send({
  from: "onboarding@resend.dev",
  to: ["zuber.nexgeno@gmail.com", "zubeir.work@gmail.com"], // ✅ 2 receivers
  subject: `New Booking — ${name}`,
  html: `
    <h2>New Booking Enquiry</h2>

    <p><b>Name:</b> ${name}</p>
    <p><b>Phone:</b> ${phone}</p>
    <p><b>Email:</b> ${email || "Not provided"}</p>
    <p><b>Event:</b> ${event}</p>
    <p><b>Date:</b> ${date || "Not selected"}</p>
    <p><b>Location:</b> ${address}</p>
    <p><b>Message:</b> ${message}</p>

    <hr/>
    <p style="color:gray;font-size:12px;">Sent from your website form</p>
  `
});

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("ERROR:", error); // 👈 IMPORTANT
    return res.status(500).json({ error: "Internal Server Error" });
  }
}