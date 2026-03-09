<?php
/**
 * GET /api/cpanel/stats
 * Return real resource usage stats from cPanel or DirectAdmin.
 */
require_once __DIR__ . '/../../config/bootstrap.php';

$userId = authenticate();

$stmt = db()->prepare("
    SELECT ho.*, hp.name as plan_name, hp.disk_space_gb, hp.bandwidth_gb,
           hp.email_accounts as plan_emails, hp.databases as plan_databases
    FROM hosting_orders ho 
    LEFT JOIN hosting_plans hp ON ho.plan_id = hp.id 
    WHERE ho.user_id = :user_id AND ho.status = 'active' 
    ORDER BY ho.created_at DESC 
    LIMIT 1
");
$stmt->execute(['user_id' => $userId]);
$order = $stmt->fetch();

if (!$order) {
    jsonResponse(null, 200);
}

if (empty($order['cpanel_username'])) {
    // Hosting exists but not yet provisioned — return plan limits with zero usage
    jsonResponse([
        'disk'       => ['used_mb' => 0, 'limit_mb' => $order['disk_space_gb'] * 1024, 'percent' => 0],
        'bandwidth'  => ['used_mb' => 0, 'limit_mb' => $order['bandwidth_gb'] * 1024, 'percent' => 0],
        'email'      => ['count' => 0, 'limit' => $order['plan_emails']],
        'databases'  => ['count' => 0, 'limit' => $order['plan_databases']],
        'plan_name'  => $order['plan_name'],
        'status'     => $order['status'],
        'panel_type' => $order['panel_type'] ?? 'cpanel',
        'expires_at' => $order['expires_at'],
        'provisioned' => false,
    ]);
}

$panelType = $order['panel_type'] ?? 'cpanel';

try {
    if ($panelType === 'directadmin') {
        $service = new DirectAdminService();
    } else {
        $service = new WHMService();
    }
    $stats = $service->getAccountStats($order['cpanel_username']);
} catch (Exception $e) {
    jsonResponse(['error' => 'Failed to fetch stats: ' . $e->getMessage()], 500);
}

if (!($stats['success'] ?? false)) {
    jsonResponse(['error' => 'Could not retrieve account stats'], 500);
}

// Calculate percentages
$diskPercent = $stats['disk_limit_mb'] > 0
    ? round(($stats['disk_used_mb'] / $stats['disk_limit_mb']) * 100, 1)
    : 0;

$bwPercent = $stats['bandwidth_limit_mb'] > 0
    ? round(($stats['bandwidth_used_mb'] / $stats['bandwidth_limit_mb']) * 100, 1)
    : 0;

jsonResponse([
    'disk' => [
        'used_mb'  => $stats['disk_used_mb'],
        'limit_mb' => $stats['disk_limit_mb'],
        'percent'  => $diskPercent,
    ],
    'bandwidth' => [
        'used_mb'  => $stats['bandwidth_used_mb'],
        'limit_mb' => $stats['bandwidth_limit_mb'],
        'percent'  => $bwPercent,
    ],
    'email' => [
        'count' => $stats['email_accounts'],
        'limit' => $stats['email_limit'],
    ],
    'databases' => [
        'count' => $stats['databases'],
        'limit' => $stats['database_limit'],
    ],
    'plan_name'  => $order['plan_name'],
    'status'     => $order['status'],
    'panel_type' => $panelType,
    'expires_at' => $order['expires_at'],
    'provisioned' => true,
]);
