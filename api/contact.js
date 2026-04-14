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
  from: 'onboarding@resend.dev',
  to: ['zuber.nexgeno@gmail.com'],
  subject: `New Booking — ${name}`,
  html: `<p>${name} - ${phone} - ${message}</p>`
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