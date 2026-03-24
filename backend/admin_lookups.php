<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/database.php';

function getLookupConfig(string $type): ?array
{
    $map = [
        'skills' => [
            'table' => 'skills',
            'idCol' => 'skill_id',
            'nameCol' => 'skill_name',
            'parentCol' => null,
            'parentType' => null,
        ],
        'categories' => [
            'table' => 'cv_categories',
            'idCol' => 'category_id',
            'nameCol' => 'category_name',
            'parentCol' => null,
            'parentType' => null,
        ],
        'degree-levels' => [
            'table' => 'degree_levels',
            'idCol' => 'degree_level_id',
            'nameCol' => 'degree_name',
            'parentCol' => null,
            'parentType' => null,
        ],
        'majors' => [
            'table' => 'majors',
            'idCol' => 'major_id',
            'nameCol' => 'major_name',
            'parentCol' => null,
            'parentType' => null,
        ],
        'industries' => [
            'table' => 'industries',
            'idCol' => 'industry_id',
            'nameCol' => 'industry_name',
            'parentCol' => null,
            'parentType' => null,
        ],
        'employment-types' => [
            'table' => 'employment_types',
            'idCol' => 'employment_type_id',
            'nameCol' => 'employment_type',
            'parentCol' => null,
            'parentType' => null,
        ],
        'certificates' => [
            'table' => 'certificates',
            'idCol' => 'certificate_id',
            'nameCol' => 'certificate_name',
            'parentCol' => null,
            'parentType' => null,
        ],
        'countries' => [
            'table' => 'countries',
            'idCol' => 'country_id',
            'nameCol' => 'country_name',
            'parentCol' => null,
            'parentType' => null,
        ],
        'cities' => [
            'table' => 'cities',
            'idCol' => 'city_id',
            'nameCol' => 'city_name',
            'parentCol' => 'country_id',
            'parentType' => 'countries',
        ],
        'districts' => [
            'table' => 'districts',
            'idCol' => 'district_id',
            'nameCol' => 'district_name',
            'parentCol' => 'city_id',
            'parentType' => 'cities',
        ],
    ];

    return $map[$type] ?? null;
}

function getInputBody(): array
{
    $raw = file_get_contents('php://input');
    $json = json_decode($raw, true);
    if (!is_array($json)) {
        return [];
    }
    return $json;
}

function validateLookupConfig(?array $config): array
{
    if (!$config) {
        http_response_code(400);
        echo json_encode(['error' => 'Unknown lookup type']);
        exit;
    }
    return $config;
}

function resolveTypeParam(array $input): string
{
    $type = '';
    if (isset($_GET['type'])) {
        $type = trim((string)$_GET['type']);
    }
    if ($type === '' && isset($input['type'])) {
        $type = trim((string)$input['type']);
    }
    if ($type === '') {
        http_response_code(400);
        echo json_encode(['error' => 'type is required']);
        exit;
    }
    return $type;
}

function getLookupItemById(mysqli $conn, array $config, int $id): ?array
{
    $table = $config['table'];
    $idCol = $config['idCol'];
    $nameCol = $config['nameCol'];
    $parentCol = $config['parentCol'];

    $selectParent = $parentCol ? ", $parentCol AS parent_id" : '';
    $sql = "SELECT $idCol AS id, $nameCol AS name$selectParent FROM $table WHERE $idCol = ? LIMIT 1";
    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        return null;
    }
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result ? $result->fetch_assoc() : null;
    $stmt->close();
    if (!$row) {
        return null;
    }
    return [
        'id' => (int)$row['id'],
        'name' => (string)$row['name'],
        'parentId' => $parentCol ? (int)$row['parent_id'] : null,
    ];
}

$input = getInputBody();
$method = $_SERVER['REQUEST_METHOD'];
$type = resolveTypeParam($input);
$config = validateLookupConfig(getLookupConfig($type));

$table = $config['table'];
$idCol = $config['idCol'];
$nameCol = $config['nameCol'];
$parentCol = $config['parentCol'];
$parentType = $config['parentType'];

if ($method === 'GET') {
    $rows = [];
    $parentId = null;
    if ($parentCol && isset($_GET['parentId']) && trim((string)$_GET['parentId']) !== '') {
        $parentId = (int)$_GET['parentId'];
    }

    $selectParent = $parentCol ? ", $parentCol AS parent_id" : '';
    $sql = "SELECT $idCol AS id, $nameCol AS name$selectParent FROM $table";
    if ($parentCol && $parentId !== null && $parentId > 0) {
        $sql .= " WHERE $parentCol = ?";
    }
    $sql .= " ORDER BY $nameCol";

    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to prepare query']);
        exit;
    }
    if ($parentCol && $parentId !== null && $parentId > 0) {
        $stmt->bind_param('i', $parentId);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $rows[] = [
                'id' => (int)$row['id'],
                'name' => (string)$row['name'],
                'parentId' => $parentCol ? (int)$row['parent_id'] : null,
            ];
        }
    }
    $stmt->close();

    echo json_encode([
        'type' => $type,
        'items' => $rows,
        'meta' => [
            'parentType' => $parentType,
            'parentRequired' => $parentCol !== null,
        ],
    ]);
    exit;
}

if ($method === 'POST') {
    $name = isset($input['name']) ? trim((string)$input['name']) : '';
    if ($name === '') {
        http_response_code(400);
        echo json_encode(['error' => 'name is required']);
        exit;
    }

    $parentId = null;
    if ($parentCol) {
        if (!isset($input['parentId']) || (int)$input['parentId'] <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'parentId is required']);
            exit;
        }
        $parentId = (int)$input['parentId'];
    }

    if ($parentCol) {
        $sql = "INSERT INTO $table ($nameCol, $parentCol) VALUES (?, ?)";
        $stmt = $conn->prepare($sql);
        if ($stmt === false) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to prepare insert']);
            exit;
        }
        $stmt->bind_param('si', $name, $parentId);
    } else {
        $sql = "INSERT INTO $table ($nameCol) VALUES (?)";
        $stmt = $conn->prepare($sql);
        if ($stmt === false) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to prepare insert']);
            exit;
        }
        $stmt->bind_param('s', $name);
    }

    if (!$stmt->execute()) {
        $stmt->close();
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create lookup value']);
        exit;
    }

    $newId = (int)$stmt->insert_id;
    $stmt->close();

    $item = getLookupItemById($conn, $config, $newId);
    echo json_encode(['success' => true, 'item' => $item]);
    exit;
}

if ($method === 'PUT') {
    $id = isset($input['id']) ? (int)$input['id'] : 0;
    $name = isset($input['name']) ? trim((string)$input['name']) : '';
    if ($id <= 0 || $name === '') {
        http_response_code(400);
        echo json_encode(['error' => 'id and name are required']);
        exit;
    }

    $parentId = null;
    if ($parentCol) {
        if (!isset($input['parentId']) || (int)$input['parentId'] <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'parentId is required']);
            exit;
        }
        $parentId = (int)$input['parentId'];
    }

    if ($parentCol) {
        $sql = "UPDATE $table SET $nameCol = ?, $parentCol = ? WHERE $idCol = ?";
        $stmt = $conn->prepare($sql);
        if ($stmt === false) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to prepare update']);
            exit;
        }
        $stmt->bind_param('sii', $name, $parentId, $id);
    } else {
        $sql = "UPDATE $table SET $nameCol = ? WHERE $idCol = ?";
        $stmt = $conn->prepare($sql);
        if ($stmt === false) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to prepare update']);
            exit;
        }
        $stmt->bind_param('si', $name, $id);
    }

    if (!$stmt->execute()) {
        $stmt->close();
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update lookup value']);
        exit;
    }
    $stmt->close();

    $item = getLookupItemById($conn, $config, $id);
    echo json_encode(['success' => true, 'item' => $item]);
    exit;
}

if ($method === 'DELETE') {
    $id = 0;
    if (isset($_GET['id'])) {
        $id = (int)$_GET['id'];
    } elseif (isset($input['id'])) {
        $id = (int)$input['id'];
    }
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'id is required']);
        exit;
    }

    $sql = "DELETE FROM $table WHERE $idCol = ?";
    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to prepare delete']);
        exit;
    }
    $stmt->bind_param('i', $id);
    $ok = $stmt->execute();
    $stmt->close();

    if (!$ok) {
        http_response_code(409);
        echo json_encode([
            'error' => 'Delete failed. This value may be referenced by other records.',
        ]);
        exit;
    }

    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
exit;

