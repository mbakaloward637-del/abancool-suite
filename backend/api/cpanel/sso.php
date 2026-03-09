<?php
/**
 * GET /api/cpanel/sso
 * Generate a one-time SSO login URL for the user's hosting panel.
 */
require_once __DIR__ . '/../../config/bootstrap.php';

$userId = authenticate();

// Get active hosting order
$stmt = db()->prepare("
    SELECT ho.*, hp.name as plan_name 
    FROM hosting_orders ho 
    LEFT JOIN hosting_plans hp ON ho.plan_id = hp.id 
    WHERE ho.user_id = :user_id AND ho.status = 'active' 
    ORDER BY ho.created_at DESC 
    LIMIT 1
");
$stmt->execute(['user_id' => $userId]);
$order = $stmt->fetch();

if (!$order) {
    jsonResponse([
        'error'    => 'No active hosting found',
        'redirect' => '/client/dashboard/hosting',
    ], 404);
}

if (empty($order['cpanel_username'])) {
    jsonResponse(['error' => 'Hosting account not yet provisioned'], 503);
}

$panelType = $order['panel_type'] ?? 'cpanel';
$url = null;

try {
    if ($panelType === 'directadmin') {
        $da = new DirectAdminService();
        $url = $da->createLoginUrl($order['cpanel_username']);
    } else {
        $whm = new WHMService();
        $url = $whm->createSession($order['cpanel_username']);
    }
} catch (Exception $e) {
    jsonResponse(['error' => 'Failed to create panel session: ' . $e->getMessage()], 500);
}

if (!$url) {
    jsonResponse(['error' => 'Could not generate login URL'], 500);
}

jsonResponse([
    'url'   => $url,
    'panel' => $panelType,
]);
