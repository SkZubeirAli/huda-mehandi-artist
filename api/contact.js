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