import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false });
  }

  const { name, phone, email, event, date, address, message } = req.body;

  try {
    // 📩 Send to YOU
    await resend.emails.send({
      from: 'Huda <onboarding@resend.dev>',
      to: ['zuber.nexgeno@gmail.com','zubeir.work@gmail.com'],
      subject: `New Booking — ${name}`,
      html: `
        <h2>New Enquiry</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Event:</b> ${event}</p>
        <p><b>Date:</b> ${date}</p>
        <p><b>address:</b> ${address}</p>
        <p><b>Message:</b> ${message}</p>
      `
    });

    // 📩 AUTO REPLY
    if (email) {
      await resend.emails.send({
        from: 'Huda <onboarding@resend.dev>',
        to: email,
        subject: 'We received your enquiry ✨',
        html: `<p>Hi ${name}, we will contact you soon 💛</p>`
      });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    return res.status(500).json({ success: false });
  }
}