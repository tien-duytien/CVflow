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

if (!$input || !isset($input['action'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Action is required']);
    exit;
}

$action = $input['action'];

if ($action === 'request_reset') {
    $email = isset($input['email']) ? trim($input['email']) : '';

    if ($email === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Email is required']);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid email format']);
        exit;
    }

    $stmt = $conn->prepare('SELECT user_id FROM users WHERE email = ? LIMIT 1');
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows === 0) {
        // Don't reveal whether email exists - still return success
        echo json_encode(['success' => true, 'message' => 'If the email exists, a reset token has been generated.']);
        $stmt->close();
        exit;
    }

    $stmt->bind_result($userId);
    $stmt->fetch();
    $stmt->close();

    $token = bin2hex(random_bytes(32));
    $expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));

    // Create password_resets table if not exists
    $conn->query("CREATE TABLE IF NOT EXISTS password_resets (
        reset_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(64) NOT NULL,
        expires_at DATETIME NOT NULL,
        used TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_token (token),
        INDEX idx_user_id (user_id)
    )");

    // Invalidate previous tokens for this user
    $stmt = $conn->prepare('UPDATE password_resets SET used = 1 WHERE user_id = ? AND used = 0');
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $stmt->close();

    // Insert new token
    $stmt = $conn->prepare('INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)');
    $stmt->bind_param('iss', $userId, $token, $expiresAt);
    $stmt->execute();
    $stmt->close();

    // In production, send email with token. For demo, return the token directly.
    echo json_encode([
        'success' => true,
        'message' => 'If the email exists, a reset token has been generated.',
        'token' => $token,
        'expires_at' => $expiresAt,
    ]);
    exit;
}

if ($action === 'reset_password') {
    $token = isset($input['token']) ? trim($input['token']) : '';
    $newPassword = isset($input['newPassword']) ? $input['newPassword'] : '';

    if ($token === '' || $newPassword === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Token and new password are required']);
        exit;
    }

    if (strlen($newPassword) < 6) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Password must be at least 6 characters']);
        exit;
    }

    $stmt = $conn->prepare('SELECT reset_id, user_id, expires_at, used FROM password_resets WHERE token = ? LIMIT 1');
    $stmt->bind_param('s', $token);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid or expired token']);
        $stmt->close();
        exit;
    }

    $reset = $result->fetch_assoc();
    $stmt->close();

    if ($reset['used']) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Token has already been used']);
        exit;
    }

    if (strtotime($reset['expires_at']) < time()) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Token has expired']);
        exit;
    }

    $passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);
    $userId = (int)$reset['user_id'];

    $stmt = $conn->prepare('UPDATE users SET password_hash = ? WHERE user_id = ?');
    $stmt->bind_param('si', $passwordHash, $userId);
    $stmt->execute();
    $stmt->close();

    // Mark token as used
    $stmt = $conn->prepare('UPDATE password_resets SET used = 1 WHERE reset_id = ?');
    $resetId = (int)$reset['reset_id'];
    $stmt->bind_param('i', $resetId);
    $stmt->execute();
    $stmt->close();

    echo json_encode(['success' => true, 'message' => 'Password has been reset successfully']);
    exit;
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Invalid action']);
exit;
