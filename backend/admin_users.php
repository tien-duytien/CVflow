<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

require_once __DIR__ . '/database.php';

function tableHasColumn(mysqli $conn, string $tableName, string $columnName): bool
{
    $sql = "SELECT COUNT(*) AS cnt
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = ?
              AND COLUMN_NAME = ?";
    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        return false;
    }
    $stmt->bind_param('ss', $tableName, $columnName);
    $stmt->execute();
    $result = $stmt->get_result();
    $exists = false;
    if ($result && $row = $result->fetch_assoc()) {
        $exists = ((int)$row['cnt']) > 0;
    }
    $stmt->close();
    return $exists;
}

function getRoleCounts(array $users): array
{
    $admins = 0;
    $employers = 0;
    $seekers = 0;
    $activeCvs = 0;
    $activeUsers = 0;

    foreach ($users as $user) {
        if ($user['role'] === 'admin') {
            $admins++;
        } elseif ($user['role'] === 'employer') {
            $employers++;
        } else {
            $seekers++;
        }

        if ((int)$user['cvCount'] > 0) {
            $activeCvs++;
        }

        if (!isset($user['isActive']) || $user['isActive'] !== false) {
            $activeUsers++;
        }
    }

    return [
        'totalUsers' => count($users),
        'activeUsers' => $activeUsers,
        'admins' => $admins,
        'employers' => $employers,
        'seekers' => $seekers,
        'activeCvs' => $activeCvs,
    ];
}

$q = isset($_GET['q']) ? trim($_GET['q']) : '';
$role = isset($_GET['role']) ? trim($_GET['role']) : '';
$allowedRoles = ['seeker', 'employer', 'admin'];
if ($role !== '' && !in_array($role, $allowedRoles, true)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid role filter']);
    exit;
}

$hasDeletedAt = tableHasColumn($conn, 'users', 'deleted_at');
$hasCreatedAt = tableHasColumn($conn, 'users', 'created_at');
$hasIsActive = tableHasColumn($conn, 'users', 'is_active');

$conditions = [];
$params = [];
$types = '';

if ($hasDeletedAt) {
    $conditions[] = 'u.deleted_at IS NULL';
}

if ($role !== '') {
    $conditions[] = 'r.role_name = ?';
    $params[] = $role;
    $types .= 's';
}

if ($q !== '') {
    $conditions[] = '(u.email LIKE ? OR c.full_name LIKE ?)';
    $like = '%' . $q . '%';
    $params[] = $like;
    $params[] = $like;
    $types .= 'ss';
}

$whereSql = '';
if (!empty($conditions)) {
    $whereSql = ' WHERE ' . implode(' AND ', $conditions);
}

$createdAtSelect = $hasCreatedAt ? 'MAX(u.created_at)' : 'NULL';
$isActiveSelect = $hasIsActive ? 'MAX(u.is_active)' : 'NULL';

$sql = "SELECT
            u.user_id,
            u.email,
            r.role_name,
            COALESCE(NULLIF(MAX(c.full_name), ''), '') AS full_name,
            COUNT(DISTINCT c.cv_id) AS cv_count,
            $createdAtSelect AS created_at,
            $isActiveSelect AS is_active
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.role_id
        LEFT JOIN cvs c ON c.user_id = u.user_id
        $whereSql
        GROUP BY u.user_id, u.email, r.role_name
        ORDER BY u.user_id DESC";

$stmt = $conn->prepare($sql);
if ($stmt === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to prepare query']);
    exit;
}

if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$result = $stmt->get_result();

$users = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $name = trim((string)$row['full_name']);
        if ($name === '') {
            $email = (string)$row['email'];
            $name = strstr($email, '@', true);
            if ($name === false || $name === '') {
                $name = $email;
            }
        }

        $isActive = null;
        if ($row['is_active'] !== null) {
            $isActive = ((int)$row['is_active']) === 1;
        }

        $users[] = [
            'userId' => (int)$row['user_id'],
            'name' => $name,
            'email' => (string)$row['email'],
            'role' => (string)$row['role_name'],
            'cvCount' => (int)$row['cv_count'],
            'isActive' => $isActive,
            'createdAt' => $row['created_at'],
        ];
    }
}

$stmt->close();

echo json_encode([
    'users' => $users,
    'summary' => getRoleCounts($users),
]);
exit;

