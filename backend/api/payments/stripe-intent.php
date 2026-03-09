<?php
/**
 * POST /api/payments/stripe/intent
 * Create a Stripe PaymentIntent for an invoice.
 */
require_once __DIR__ . '/../../config/bootstrap.php';

$userId = authenticate();
$input = jsonInput();

$invoiceId = $input['invoice_id'] ?? null;
if (!$invoiceId) {
    jsonResponse(['error' => 'invoice_id is required'], 400);
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

$stripeKey = env('STRIPE_SECRET_KEY');
if (!$stripeKey) {
    jsonResponse(['error' => 'Stripe not configured'], 500);
}

// Create PaymentIntent via Stripe API (no SDK needed)
$amountCents = (int) ($invoice['amount'] * 100);

$ch = curl_init('https://api.stripe.com/v1/payment_intents');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_USERPWD        => "{$stripeKey}:",
    CURLOPT_POSTFIELDS     => http_build_query([
        'amount'               => $amountCents,
        'currency'             => 'kes',
        'metadata[invoice_id]' => $invoice['id'],
        'metadata[user_id]'    => $userId,
    ]),
]);
$stripeResponse = json_decode(curl_exec($ch), true);
curl_close($ch);

if (!isset($stripeResponse['client_secret'])) {
    jsonResponse(['error' => 'Failed to create payment intent', 'details' => $stripeResponse], 500);
}

// Create pending payment record
$insertPayment = db()->prepare("
    INSERT INTO payments (user_id, invoice_id, method, amount, currency, status, reference)
    VALUES (:uid, :iid, 'stripe', :amount, 'KES', 'pending', :ref)
");
$insertPayment->execute([
    'uid'    => $userId,
    'iid'    => $invoiceId,
    'amount' => $invoice['amount'],
    'ref'    => $stripeResponse['id'],
]);

jsonResponse([
    'client_secret' => $stripeResponse['client_secret'],
    'payment_intent_id' => $stripeResponse['id'],
]);
