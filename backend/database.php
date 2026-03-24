<?php
$db_host = "localhost";
$db_user = "root";
$db_pass = "";
$db_name = "cv_management";

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}