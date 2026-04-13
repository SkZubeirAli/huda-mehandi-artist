<?php
/**
 * contact.php — Huda Mehndi Artist Contact Form Handler
 * Sends email to two receivers + auto-reply to visitor
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

// ── Configuration ──────────────────────────────────────
$receiver_1 = 'huda.artist@example.com';        // ← Change to real email 1
$receiver_2 = 'huda.bookings@example.com';      // ← Change to real email 2
$site_name  = 'Huda Mehndi Artist';
$site_email = 'noreply@huda-mehndi.com';        // ← Change to real domain email

// ── Only accept POST ───────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// ── Sanitize inputs ────────────────────────────────────
function clean($val) {
    return htmlspecialchars(strip_tags(trim($val)), ENT_QUOTES, 'UTF-8');
}

$name     = clean($_POST['name']     ?? '');
$phone    = clean($_POST['phone']    ?? '');
$event    = clean($_POST['event']    ?? '');
$date     = clean($_POST['date']     ?? '');
$message  = clean($_POST['message']  ?? '');
$email    = filter_var(trim($_POST['email'] ?? ''), FILTER_VALIDATE_EMAIL);

// ── Validation ─────────────────────────────────────────
$errors = [];
if (empty($name))    $errors[] = 'Name is required';
if (empty($phone))   $errors[] = 'Phone number is required';
if (empty($event))   $errors[] = 'Event type is required';
if (empty($message)) $errors[] = 'Message is required';

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'errors' => $errors]);
    exit;
}

// ── Format date ────────────────────────────────────────
$formatted_date = !empty($date)
    ? date('d F Y', strtotime($date))
    : 'Not specified';

// ── Email to Huda (both receivers) ─────────────────────
$to_huda = $receiver_1 . ', ' . $receiver_2;

$subject_huda = "✨ New Booking Request from {$name} — {$event}";

$body_huda = "
<!DOCTYPE html>
<html>
<head>
<meta charset='UTF-8'>
<style>
  body      { font-family: Georgia, serif; background: #fdf6ec; margin: 0; padding: 0; }
  .wrap     { max-width: 600px; margin: 0 auto; background: #fff; border-top: 4px solid #c9963b; }
  .header   { background: #3b1f0a; padding: 2rem; text-align: center; }
  .header h1{ font-family: Georgia, serif; color: #e8c07a; font-size: 2rem; margin: 0; }
  .header p { color: rgba(232,192,122,0.6); font-size: 0.75rem; letter-spacing: 0.2em; text-transform: uppercase; margin-top: 0.3rem; }
  .body     { padding: 2.5rem; }
  .row      { display: flex; margin-bottom: 1.2rem; border-bottom: 1px solid #f5e6c8; padding-bottom: 1rem; }
  .label    { font-family: 'Arial', sans-serif; font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase; color: #c9963b; width: 140px; flex-shrink: 0; padding-top: 0.2rem; }
  .value    { color: #3b1f0a; font-size: 1rem; line-height: 1.6; }
  .msg-box  { background: #fdf6ec; border-left: 3px solid #c9963b; padding: 1.2rem 1.5rem; margin-top: 1.5rem; border-radius: 0 4px 4px 0; }
  .footer   { background: #1a0e05; padding: 1.5rem; text-align: center; color: rgba(255,255,255,0.3); font-size: 0.7rem; letter-spacing: 0.1em; }
  .gold     { color: #c9963b; }
</style>
</head>
<body>
<div class='wrap'>
  <div class='header'>
    <h1>Huda</h1>
    <p>New Booking Request</p>
  </div>
  <div class='body'>
    <p style='color:#6b3a1f;margin-bottom:2rem;'>A new client has filled in the booking form on your website. Details below:</p>
    <div class='row'>
      <div class='label'>👤 Name</div>
      <div class='value'><strong>{$name}</strong></div>
    </div>
    <div class='row'>
      <div class='label'>📱 Phone</div>
      <div class='value'>{$phone}</div>
    </div>
    " . ($email ? "<div class='row'><div class='label'>📧 Email</div><div class='value'>{$email}</div></div>" : '') . "
    <div class='row'>
      <div class='label'>🌸 Event</div>
      <div class='value'>{$event}</div>
    </div>
    <div class='row'>
      <div class='label'>📅 Preferred Date</div>
      <div class='value'>{$formatted_date}</div>
    </div>
    <div class='msg-box'>
      <div class='label' style='margin-bottom:0.5rem;'>💬 Message</div>
      <div class='value'>" . nl2br($message) . "</div>
    </div>
    <p style='margin-top:2rem;color:#6b3a1f;font-size:0.9rem;'>Reply directly to this email or WhatsApp the client to confirm their appointment.</p>
  </div>
  <div class='footer'>
    © {$site_name} · Sent from your website booking form
  </div>
</div>
</body>
</html>
";

$headers_huda  = "MIME-Version: 1.0\r\n";
$headers_huda .= "Content-Type: text/html; charset=UTF-8\r\n";
$headers_huda .= "From: {$site_name} <{$site_email}>\r\n";
if ($email) {
    $headers_huda .= "Reply-To: {$email}\r\n";
}

// ── Auto-reply to visitor ──────────────────────────────
$auto_reply_sent = false;
if ($email) {
    $subject_visitor = "Your Mehndi Enquiry has been Received — {$site_name}";

    $body_visitor = "
<!DOCTYPE html>
<html>
<head>
<meta charset='UTF-8'>
<style>
  body    { font-family: Georgia, serif; background: #fdf6ec; margin: 0; padding: 0; }
  .wrap   { max-width: 600px; margin: 0 auto; background: #fff; border-top: 4px solid #c9963b; }
  .header { background: #3b1f0a; padding: 3rem 2rem; text-align: center; }
  .header h1 { font-family: Georgia, serif; color: #e8c07a; font-size: 2.8rem; margin: 0; letter-spacing: 0.04em; }
  .header p  { color: rgba(232,192,122,0.6); font-size: 0.7rem; letter-spacing: 0.3em; text-transform: uppercase; margin-top: 0.4rem; }
  .body   { padding: 3rem 2.5rem; }
  .divider{ border: none; border-top: 1px solid #f5e6c8; margin: 2rem 0; }
  .gold   { color: #c9963b; }
  .detail-box { background: #fdf6ec; border: 1px solid rgba(201,150,59,0.3); padding: 1.5rem 2rem; margin: 1.5rem 0; }
  .detail-row { display: flex; margin-bottom: 0.8rem; font-size: 0.9rem; }
  .d-label    { color: #c9963b; width: 120px; flex-shrink: 0; font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; }
  .d-value    { color: #3b1f0a; }
  .footer { background: #1a0e05; padding: 2rem; text-align: center; }
  .footer p { color: rgba(255,255,255,0.3); font-size: 0.65rem; letter-spacing: 0.1em; margin: 0.3rem 0; }
  .footer a { color: #c9963b; text-decoration: none; }
  .btn { display: inline-block; background: #c9963b; color: #1a0e05; padding: 0.8rem 2rem; text-decoration: none; font-family: Arial, sans-serif; font-size: 0.7rem; letter-spacing: 0.2em; text-transform: uppercase; margin-top: 1rem; }
</style>
</head>
<body>
<div class='wrap'>
  <div class='header'>
    <h1>Huda</h1>
    <p>Mehndi Artist</p>
  </div>
  <div class='body'>
    <p style='font-size:1.2rem;color:#3b1f0a;margin-bottom:1rem;'>Assalamu Alaikum, <strong class='gold'>{$name}</strong>! ✨</p>
    <p style='color:#6b3a1f;line-height:1.9;font-size:1rem;'>
      Thank you so much for reaching out — your message has been received and I am truly honoured by your interest. 
      Every enquiry I receive is a new story waiting to be told through the art of henna, and I cannot wait to 
      hear more about yours.
    </p>
    <hr class='divider'>
    <p style='color:#6b3a1f;line-height:1.9;font-size:1rem;'>
      I have noted down all the beautiful details you've shared with me:
    </p>
    <div class='detail-box'>
      <div class='detail-row'><span class='d-label'>Event</span><span class='d-value'>{$event}</span></div>
      <div class='detail-row'><span class='d-label'>Date</span><span class='d-value'>{$formatted_date}</span></div>
      <div class='detail-row'><span class='d-label'>Contact</span><span class='d-value'>{$phone}</span></div>
    </div>
    <p style='color:#6b3a1f;line-height:1.9;font-size:1rem;margin-top:1.5rem;'>
      I personally review every enquiry and will be in touch with you very soon — usually within 24 hours — 
      to discuss your vision, preferred design style, and all the details that will make your henna experience 
      truly unforgettable.
    </p>
    <p style='color:#6b3a1f;line-height:1.9;font-size:1rem;margin-top:1rem;'>
      In the meantime, if you have any questions or would like to chat sooner, you are always welcome to 
      reach me on WhatsApp. I would love to get to know you and your story before we even begin!
    </p>
    <p style='text-align:center;margin-top:2rem;'>
      <a href='https://wa.me/91XXXXXXXXXX' class='btn'>💬 WhatsApp Me Directly</a>
    </p>
    <hr class='divider'>
    <p style='color:#6b3a1f;line-height:1.9;font-size:0.95rem;font-style:italic;text-align:center;'>
      \"Every hand is a canvas, every celebration a masterpiece.\"<br>
      <span class='gold'>— Huda</span>
    </p>
  </div>
  <div class='footer'>
    <p><strong style='color:#e8c07a;'>Huda Mehndi Artist</strong></p>
    <p>📍 Mumbai, India &nbsp;·&nbsp; 📞 <a href='tel:+91XXXXXXXXXX'>+91 XXXXX XXXXX</a></p>
    <p style='margin-top:0.8rem;'>Follow along on 
      <a href='#'>Instagram</a> · 
      <a href='#'>Facebook</a> · 
      <a href='#'>TikTok</a>
    </p>
    <p style='margin-top:1rem;opacity:0.4;'>You received this because you submitted an enquiry on {$site_name}.</p>
  </div>
</div>
</body>
</html>
";

    $headers_visitor  = "MIME-Version: 1.0\r\n";
    $headers_visitor .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers_visitor .= "From: {$site_name} <{$site_email}>\r\n";

    $auto_reply_sent = mail($email, $subject_visitor, $body_visitor, $headers_visitor);
}

// ── Send to Huda ───────────────────────────────────────
$sent = mail($to_huda, $subject_huda, $body_huda, $headers_huda);

// ── Response ───────────────────────────────────────────
if ($sent) {
    echo json_encode([
        'success'          => true,
        'message'          => 'Your enquiry has been submitted successfully!',
        'auto_reply_sent'  => $auto_reply_sent,
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to send email. Please try again or contact via WhatsApp.',
    ]);
}
