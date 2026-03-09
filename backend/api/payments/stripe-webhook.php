<?php
/**
 * POST /api/payments/stripe/webhook
 * Stripe webhook handler for payment confirmation.
 * No auth — verified via Stripe signature.
 */
require_once __DIR__ . '/../../config/bootstrap.php';

$rawInput = file_get_contents('php://input');
$sigHeader = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';
$webhookSecret = env('STRIPE_WEBHOOK_SECRET');

// Verify Stripe signature
if ($webhookSecret && $sigHeader) {
    $elements = [];
    foreach (explode(',', $sigHeader) as $part) {
        [$key, $value] = explode('=', $part, 2);
        $elements[$key] = $value;
    }

    $timestamp = $elements['t'] ?? '';
    $signature = $elements['v1'] ?? '';
    $signedPayload = "{$timestamp}.{$rawInput}";
    $expectedSig = hash_hmac('sha256', $signedPayload, $webhookSecret);

    if (!hash_equals($expectedSig, $signature)) {
        jsonResponse(['error' => 'Invalid signature'], 400);
    }
}

$event = json_decode($rawInput, true);

if (!$event || !isset($event['type'])) {
    jsonResponse(['error' => 'Invalid event'], 400);
}

if ($event['type'] === 'payment_intent.succeeded') {
    $paymentIntent = $event['data']['object'] ?? [];
    $invoiceId = $paymentIntent['metadata']['invoice_id'] ?? null;
    $userId = $paymentIntent['metadata']['user_id'] ?? null;
    $piId = $paymentIntent['id'] ?? '';

    if (!$invoiceId) {
        jsonResponse(['received' => true]);
    }

    // Update payment → completed
    $updatePayment = db()->prepare("
        UPDATE payments SET status = 'completed', paid_at = NOW() 
        WHERE reference = :ref AND status = 'pending'
    ");
    $updatePayment->execute(['ref' => $piId]);

    // Update invoice → paid
    $updateInvoice = db()->prepare("
        UPDATE invoices SET status = 'paid', paid_at = NOW() WHERE id = :id
    ");
    $updateInvoice->execute(['id' => $invoiceId]);

    // Find and provision hosting order
    if ($userId) {
        $invoice = db()->prepare("SELECT * FROM invoices WHERE id = :id");
        $invoice->execute(['id' => $invoiceId]);
        $inv = $invoice->fetch();

        if ($inv && $inv['service_type'] === 'hosting') {
            $orderStmt = db()->prepare("
                SELECT id FROM hosting_orders 
                WHERE user_id = :uid AND status = 'pending' 
                ORDER BY created_at DESC LIMIT 1
            ");
            $orderStmt->execute(['uid' => $userId]);
            $order = $orderStmt->fetch();

            if ($order) {
                $updateOrder = db()->prepare("
                    UPDATE hosting_orders SET amount_paid = :amount WHERE id = :id
                ");
                $updateOrder->execute([
                    'amount' => ($paymentIntent['amount'] ?? 0) / 100,
                    'id'     => $order['id'],
                ]);

                // Trigger provisioning
                $provisionUrl = (isset($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] . '/api/provisioning/provision';
                $ch = curl_init($provisionUrl);
                curl_setopt_array($ch, [
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_POST           => true,
                    CURLOPT_POSTFIELDS     => json_encode(['hosting_order_id' => $order['id']]),
                    CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
                    CURLOPT_TIMEOUT        => 60,
                ]);
                curl_exec($ch);
                curl_close($ch);
            }
        }
    }
}

jsonResponse(['received' => true]);
