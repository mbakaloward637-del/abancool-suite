<?php
/**
 * POST /api/payments/mpesa
 * Initiate M-Pesa STK Push for invoice payment.
 */
require_once __DIR__ . '/../../config/bootstrap.php';

$userId = authenticate();
$input = jsonInput();

$invoiceId = $input['invoice_id'] ?? null;
$phone = $input['phone'] ?? '';

if (!$invoiceId || !$phone) {
    jsonResponse(['error' => 'invoice_id and phone are required'], 400);
}

// Rate limit: max 1 STK per user per minute
$rateCheck = db()->prepare("
    SELECT id FROM payments 
    WHERE user_id = :uid AND method = 'mpesa' AND created_at > NOW() - INTERVAL '1 minute'
    LIMIT 1
");
$rateCheck->execute(['uid' => $userId]);
if ($rateCheck->fetch()) {
    jsonResponse(['error' => 'Please wait 1 minute before requesting another STK push'], 429);
}

// Load invoice
$stmt = db()->prepare("SELECT * FROM invoices WHERE id = :id AND user_id = :uid");
$stmt->execute(['id' => $invoiceId, 'uid' => $userId]);
$invoice = $stmt->fetch();

if (!$invoice) {
    jsonResponse(['error' => 'Invoice not found'], 404);
}
if ($invoice['status'] === 'paid') {
    jsonResponse(['error' => 'Invoice already paid'], 400);
}

// Format phone: ensure 254XXXXXXXXX
$phone = preg_replace('/[^0-9]/', '', $phone);
if (str_starts_with($phone, '0')) {
    $phone = '254' . substr($phone, 1);
} elseif (str_starts_with($phone, '+')) {
    $phone = substr($phone, 1);
}
if (!preg_match('/^254\d{9}$/', $phone)) {
    jsonResponse(['error' => 'Invalid phone number format. Use 254XXXXXXXXX'], 400);
}

// M-Pesa config
$consumerKey = env('MPESA_CONSUMER_KEY');
$consumerSecret = env('MPESA_CONSUMER_SECRET');
$shortcode = env('MPESA_SHORTCODE', '174379');
$passkey = env('MPESA_PASSKEY');
$callbackUrl = env('MPESA_CALLBACK_URL');
$mpesaEnv = env('MPESA_ENV', 'sandbox');

$baseUrl = $mpesaEnv === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';

// Step 1: Get OAuth token
$ch = curl_init("{$baseUrl}/oauth/v1/generate?grant_type=client_credentials");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_USERPWD        => "{$consumerKey}:{$consumerSecret}",
    CURLOPT_SSL_VERIFYPEER => false,
]);
$tokenResponse = json_decode(curl_exec($ch), true);
curl_close($ch);

$accessToken = $tokenResponse['access_token'] ?? null;
if (!$accessToken) {
    jsonResponse(['error' => 'Failed to authenticate with M-Pesa'], 500);
}

// Step 2: Send STK Push
$timestamp = date('YmdHis');
$password = base64_encode($shortcode . $passkey . $timestamp);

$stkPayload = [
    'BusinessShortCode' => $shortcode,
    'Password'          => $password,
    'Timestamp'         => $timestamp,
    'TransactionType'   => 'CustomerPayBillOnline',
    'Amount'            => (int) $invoice['amount'],
    'PartyA'            => $phone,
    'PartyB'            => $shortcode,
    'PhoneNumber'       => $phone,
    'CallBackURL'       => $callbackUrl,
    'AccountReference'  => $invoice['invoice_number'],
    'TransactionDesc'   => 'Payment for ' . ($invoice['service_description'] ?? $invoice['service_type']),
];

$ch = curl_init("{$baseUrl}/mpesa/stkpush/v1/processrequest");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => json_encode($stkPayload),
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_HTTPHEADER     => [
        "Authorization: Bearer {$accessToken}",
        'Content-Type: application/json',
    ],
]);
$stkResponse = json_decode(curl_exec($ch), true);
curl_close($ch);

$checkoutRequestId = $stkResponse['CheckoutRequestID'] ?? null;

if (!$checkoutRequestId) {
    jsonResponse(['error' => 'STK Push failed', 'details' => $stkResponse], 500);
}

// Create pending payment record
$payRef = 'STK-' . time();
$insertPayment = db()->prepare("
    INSERT INTO payments (user_id, invoice_id, method, amount, currency, status, reference, checkout_request_id)
    VALUES (:uid, :iid, 'mpesa', :amount, 'KES', 'pending', :ref, :crid)
");
$insertPayment->execute([
    'uid'    => $userId,
    'iid'    => $invoiceId,
    'amount' => $invoice['amount'],
    'ref'    => $payRef,
    'crid'   => $checkoutRequestId,
]);

jsonResponse([
    'success'             => true,
    'checkout_request_id' => $checkoutRequestId,
    'message'             => 'STK Push sent. Check your phone for the M-Pesa prompt.',
]);
