import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { name, phone, message } = req.body;

    if (!name || !phone || !message) {
      return res.status(400).json({ error: "Missing fields" });
    }

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: ["zuber.nexgeno@gmail.com"],
      subject: `New Contact - ${name}`,
      html: `<p>Name: ${name}</p>
             <p>Phone: ${phone}</p>
             <p>Message: ${message}</p>`
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("ERROR:", error); // 👈 IMPORTANT
    return res.status(500).json({ error: "Internal Server Error" });
  }
}