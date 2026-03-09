<?php
/**
 * POST /api/payments/mpesa/callback
 * Safaricom M-Pesa STK Push callback handler.
 * No auth — called by Safaricom servers.
 */
require_once __DIR__ . '/../../config/bootstrap.php';

// Log raw callback for debugging
$rawInput = file_get_contents('php://input');
file_put_contents(__DIR__ . '/../../logs/mpesa_callback_' . date('Y-m-d_H-i-s') . '.json', $rawInput);

$data = json_decode($rawInput, true);

$resultCode = $data['Body']['stkCallback']['ResultCode'] ?? -1;
$checkoutRequestId = $data['Body']['stkCallback']['CheckoutRequestID'] ?? '';

if (!$checkoutRequestId) {
    jsonResponse(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
}

// Find payment by checkout_request_id
$stmt = db()->prepare("SELECT * FROM payments WHERE checkout_request_id = :crid LIMIT 1");
$stmt->execute(['crid' => $checkoutRequestId]);
$payment = $stmt->fetch();

if (!$payment) {
    jsonResponse(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
}

if ($resultCode == 0) {
    // SUCCESS — Extract callback metadata
    $callbackItems = $data['Body']['stkCallback']['CallbackMetadata']['Item'] ?? [];
    $mpesaReceipt = '';
    $amount = 0;
    $phone = '';

    foreach ($callbackItems as $item) {
        switch ($item['Name']) {
            case 'MpesaReceiptNumber':
                $mpesaReceipt = $item['Value'] ?? '';
                break;
            case 'Amount':
                $amount = $item['Value'] ?? 0;
                break;
            case 'PhoneNumber':
                $phone = $item['Value'] ?? '';
                break;
        }
    }

    // Update payment → completed
    $updatePayment = db()->prepare("
        UPDATE payments SET 
            status = 'completed', 
            mpesa_receipt = :receipt, 
            paid_at = NOW(),
            reference = :ref
        WHERE id = :id
    ");
    $updatePayment->execute([
        'receipt' => $mpesaReceipt,
        'ref'     => $mpesaReceipt ?: $payment['reference'],
        'id'      => $payment['id'],
    ]);

    // Update invoice → paid
    if ($payment['invoice_id']) {
        $updateInvoice = db()->prepare("
            UPDATE invoices SET status = 'paid', paid_at = NOW() WHERE id = :id
        ");
        $updateInvoice->execute(['id' => $payment['invoice_id']]);

        // Find hosting order linked to this invoice's service
        $invoiceStmt = db()->prepare("SELECT * FROM invoices WHERE id = :id");
        $invoiceStmt->execute(['id' => $payment['invoice_id']]);
        $invoice = $invoiceStmt->fetch();

        if ($invoice && $invoice['service_type'] === 'hosting') {
            // Find the pending hosting order for this user
            $orderStmt = db()->prepare("
                SELECT id FROM hosting_orders 
                WHERE user_id = :uid AND status = 'pending' 
                ORDER BY created_at DESC LIMIT 1
            ");
            $orderStmt->execute(['uid' => $payment['user_id']]);
            $order = $orderStmt->fetch();

            if ($order) {
                // Update amount_paid
                $updateOrder = db()->prepare("
                    UPDATE hosting_orders SET amount_paid = :amount WHERE id = :id
                ");
                $updateOrder->execute(['amount' => $amount, 'id' => $order['id']]);

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
} else {
    // FAILED
    $updatePayment = db()->prepare("UPDATE payments SET status = 'failed' WHERE id = :id");
    $updatePayment->execute(['id' => $payment['id']]);
}

jsonResponse(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
