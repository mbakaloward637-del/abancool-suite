<?php
/**
 * GET /api/cpanel/status
 * Quick check: does the user have active hosting?
 */
require_once __DIR__ . '/../../config/bootstrap.php';

$userId = authenticate();

$stmt = db()->prepare("
    SELECT ho.id, ho.status, ho.domain, ho.cpanel_username, ho.expires_at,
           hp.name as plan_name
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
        'has_hosting' => false,
        'redirect'    => '/client/dashboard/hosting',
    ]);
}

jsonResponse([
    'has_hosting'      => true,
    'plan_name'        => $order['plan_name'],
    'domain'           => $order['domain'],
    'cpanel_username'  => $order['cpanel_username'],
    'expires_at'       => $order['expires_at'],
    'status'           => $order['status'],
]);
