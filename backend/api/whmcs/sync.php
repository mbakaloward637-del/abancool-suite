<?php
/**
 * POST /api/whmcs/sync
 * Internal-only: sync a user and hosting order to WHMCS.
 */
require_once __DIR__ . '/../../config/bootstrap.php';

$input = jsonInput();
$userId = $input['user_id'] ?? null;
$orderId = $input['hosting_order_id'] ?? null;

if (!$userId || !$orderId) {
    jsonResponse(['error' => 'user_id and hosting_order_id are required'], 400);
}

// Load user profile
$userStmt = db()->prepare("SELECT * FROM profiles WHERE id = :id");
$userStmt->execute(['id' => $userId]);
$user = $userStmt->fetch();

if (!$user) {
    jsonResponse(['error' => 'User not found'], 404);
}

// Load hosting order with plan
$orderStmt = db()->prepare("
    SELECT ho.*, hp.name as plan_name, hp.slug as plan_slug, hp.whmcs_product_id
    FROM hosting_orders ho
    LEFT JOIN hosting_plans hp ON ho.plan_id = hp.id
    WHERE ho.id = :id
");
$orderStmt->execute(['id' => $orderId]);
$order = $orderStmt->fetch();

if (!$order) {
    jsonResponse(['error' => 'Hosting order not found'], 404);
}

$whmcs = new WHMCSService();

// Find or create WHMCS client
$client = $whmcs->getClientByEmail($user['email']);
$clientId = $client ? (int) $client['id'] : null;

if (!$clientId) {
    $nameParts = explode(' ', $user['name'] ?? 'Customer', 2);
    $clientId = $whmcs->addClient([
        'firstname' => $nameParts[0],
        'lastname'  => $nameParts[1] ?? '',
        'email'     => $user['email'],
        'phone'     => $user['phone'] ?? '',
    ]);
}

if (!$clientId) {
    jsonResponse(['error' => 'Failed to create/find WHMCS client'], 500);
}

// Create order in WHMCS
$whmcsOrderId = null;
if ($order['whmcs_product_id']) {
    $billingCycle = $order['billing_cycle'] === 'monthly' ? 'monthly' : 'annually';
    $domain = $order['domain'] ?? 'default.abancool.com';
    $whmcsOrderId = $whmcs->addOrder($clientId, (int) $order['whmcs_product_id'], $domain, $billingCycle);

    if ($whmcsOrderId) {
        $whmcs->acceptOrder($whmcsOrderId);
    }
}

// Store WHMCS client ID on profile
$updateProfile = db()->prepare("UPDATE profiles SET whmcs_client_id = :wid WHERE id = :uid");
$updateProfile->execute(['wid' => $clientId, 'uid' => $userId]);

jsonResponse([
    'success'         => true,
    'whmcs_client_id' => $clientId,
    'whmcs_order_id'  => $whmcsOrderId,
]);
