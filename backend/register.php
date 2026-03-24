<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/database.php';

$input = json_decode(file_get_contents('php://input'), true);

if (
    !$input ||
    !isset($input['email']) ||
    !isset($input['password']) ||
    !isset($input['role'])
) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Email, password and role are required']);
    exit;
}

$email = trim($input['email']);
$password = $input['password'];
$roleName = trim($input['role']);

if ($email === '' || $password === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Email and password cannot be empty']);
    exit;
}

// Only allow known roles
if (!in_array($roleName, ['seeker', 'employer', 'admin'], true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid role']);
    exit;
}

// Check if email already exists
$stmt = $conn->prepare('SELECT user_id FROM users WHERE email = ? LIMIT 1');
$stmt->bind_param('s', $email);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows > 0) {
    http_response_code(409);
    echo json_encode(['success' => false, 'error' => 'Email already registered']);
    $stmt->close();
    exit;
}
$stmt->close();

// Find role_id
$stmt = $conn->prepare('SELECT role_id FROM roles WHERE role_name = ? LIMIT 1');
$stmt->bind_param('s', $roleName);
$stmt->execute();
$stmt->bind_result($roleId);
if (!$stmt->fetch()) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Role not found in database']);
    $stmt->close();
    exit;
}
$stmt->close();

$passwordHash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $conn->prepare('INSERT INTO users (email, password_hash, role_id) VALUES (?, ?, ?)');
$stmt->bind_param('ssi', $email, $passwordHash, $roleId);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Account created successfully']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to create account']);
}

$stmt->close();
exit;

