<?php
header('Content-Type: application/json');

$recipient = 'info@digitechdstv.co.za';

function respond($success, $error = null) {
    echo json_encode(['success' => $success, 'error' => $error]);
    exit;
}

function sanitizeHeader($value) {
    return str_replace(["\r", "\n"], '', $value);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    respond(false, 'Invalid request method.');
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!is_array($data)) {
    http_response_code(400);
    respond(false, 'Invalid request body.');
}

// Honeypot: if this hidden field is filled, it's a bot. Pretend success, do nothing.
if (!empty($data['website'])) {
    respond(true);
}

$name = trim($data['name'] ?? '');
$phone = trim($data['phone'] ?? '');
$email = trim($data['email'] ?? '');
$city = trim($data['city'] ?? '');
$service = trim($data['service'] ?? '');
$message = mb_substr(trim($data['message'] ?? ''), 0, 2000);

if ($name === '' || $phone === '' || $email === '' || $city === '' || $service === '') {
    http_response_code(422);
    respond(false, 'Please fill in all required fields.');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    respond(false, 'Please enter a valid email address.');
}

$subject = 'New Contact Form Submission - ' . sanitizeHeader($service);

$body = "New enquiry from digitechdstv.co.za\n\n";
$body .= "Name: $name\n";
$body .= "Phone: $phone\n";
$body .= "Email: $email\n";
$body .= "City: $city\n";
$body .= "Service Needed: $service\n";
$body .= "Message: " . ($message !== '' ? $message : '(none)') . "\n";

$headers = "From: no-reply@digitechdstv.co.za\r\n";
$headers .= "Reply-To: " . sanitizeHeader($email) . "\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$sent = mail($recipient, $subject, $body, $headers);

if (!$sent) {
    http_response_code(500);
    respond(false, 'Could not send message. Please call or WhatsApp us directly.');
}

respond(true);
