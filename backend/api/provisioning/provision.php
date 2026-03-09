<?php
/**
 * POST /api/provisioning/provision
 * Auto-provision a hosting account after payment confirmation.
 * Called internally by payment callbacks — NOT user-facing.
 */
require_once __DIR__ . '/../../config/bootstrap.php';

$input = jsonInput();
$orderId = $input['hosting_order_id'] ?? null;

if (!$orderId) {
    jsonResponse(['error' => 'hosting_order_id required'], 400);
}

// Load order with plan and user info
$stmt = db()->prepare("
    SELECT ho.*, hp.name as plan_name, hp.slug as plan_slug,
           p.email as user_email, p.name as user_name
    FROM hosting_orders ho
    LEFT JOIN hosting_plans hp ON ho.plan_id = hp.id
    LEFT JOIN profiles p ON ho.user_id = p.id
    WHERE ho.id = :id
");
$stmt->execute(['id' => $orderId]);
$order = $stmt->fetch();

if (!$order) {
    jsonResponse(['error' => 'Hosting order not found'], 404);
}

if ($order['status'] === 'active') {
    jsonResponse(['message' => 'Already provisioned', 'success' => true]);
}

$domain = $order['domain'] ?? 'default.abancool.com';
$email = $order['user_email'] ?? '';
$panelType = $order['panel_type'] ?? 'cpanel';

// Generate unique username
$baseUsername = preg_replace('/[^a-z0-9]/', '', strtolower($domain));
$username = substr($baseUsername, 0, 8);

// Ensure username uniqueness
$check = db()->prepare("SELECT id FROM hosting_orders WHERE cpanel_username = :u AND id != :id");
$check->execute(['u' => $username, 'id' => $orderId]);
if ($check->fetch()) {
    $username = substr($baseUsername, 0, 5) . rand(100, 999);
}

$cpanelUrl = '';
$provisionResult = [];

try {
    if ($panelType === 'directadmin') {
        $da = new DirectAdminService();
        $password = bin2hex(random_bytes(8));
        $provisionResult = $da->createAccount($username, $domain, $order['plan_slug'], $email, $password);
        $cpanelUrl = "https://" . env('DA_HOST') . ":" . env('DA_PORT', 2222);
    } else {
        $whm = new WHMService();
        $provisionResult = $whm->createAccount($username, $domain, $order['plan_slug'], $email);
        $cpanelUrl = $provisionResult['cpanel_url'] ?? "https://" . env('WHM_HOST') . ":2083";
    }
} catch (Exception $e) {
    jsonResponse(['error' => 'Provisioning failed: ' . $e->getMessage()], 500);
}

if (!($provisionResult['success'] ?? false)) {
    jsonResponse([
        'error' => 'Panel account creation failed',
        'details' => $provisionResult['raw'] ?? $provisionResult,
    ], 500);
}

// Calculate expiry
$billingCycle = $order['billing_cycle'] ?? 'yearly';
$interval = $billingCycle === 'monthly' ? '+1 month' : '+1 year';
$expiresAt = date('Y-m-d H:i:s', strtotime($interval));

// Update hosting order
$update = db()->prepare("
    UPDATE hosting_orders SET
        status = 'active',
        cpanel_username = :username,
        cpanel_url = :cpanel_url,
        panel_type = :panel_type,
        starts_at = NOW(),
        expires_at = :expires_at,
        updated_at = NOW()
    WHERE id = :id
");
$update->execute([
    'username'   => $username,
    'cpanel_url' => $cpanelUrl,
    'panel_type' => $panelType,
    'expires_at' => $expiresAt,
    'id'         => $orderId,
]);

// Optional: Sync to WHMCS
if (env('WHMCS_URL') && env('WHMCS_API_IDENTIFIER')) {
    try {
        $whmcs = new WHMCSService();

        // Find or create WHMCS client
        $client = $whmcs->getClientByEmail($email);
        $clientId = $client ? (int) $client['id'] : null;

        if (!$clientId) {
            $nameParts = explode(' ', $order['user_name'] ?? 'Customer', 2);
            $clientId = $whmcs->addClient([
                'firstname' => $nameParts[0],
                'lastname'  => $nameParts[1] ?? '',
                'email'     => $email,
            ]);
        }

        if ($clientId) {
            // Get WHMCS product ID from plan (if configured)
            $planStmt = db()->prepare("SELECT whmcs_product_id FROM hosting_plans WHERE id = :id");
            $planStmt->execute(['id' => $order['plan_id']]);
            $plan = $planStmt->fetch();

            if ($plan && $plan['whmcs_product_id']) {
                $whmcsBilling = $billingCycle === 'monthly' ? 'monthly' : 'annually';
                $whmcsOrderId = $whmcs->addOrder($clientId, (int) $plan['whmcs_product_id'], $domain, $whmcsBilling);
                if ($whmcsOrderId) {
                    $whmcs->acceptOrder($whmcsOrderId);
                }
            }

            // Store WHMCS client ID
            $updateProfile = db()->prepare("UPDATE profiles SET whmcs_client_id = :wid WHERE id = :uid");
            $updateProfile->execute(['wid' => $clientId, 'uid' => $order['user_id']]);
        }
    } catch (Exception $e) {
        // WHMCS sync failure should not break provisioning
        error_log("WHMCS sync failed for order {$orderId}: " . $e->getMessage());
    }
}

jsonResponse([
    'success'  => true,
    'username' => $username,
    'panel'    => $panelType,
    'url'      => $cpanelUrl,
]);
