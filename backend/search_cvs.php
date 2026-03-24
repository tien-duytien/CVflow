<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/database.php';
require_once __DIR__ . '/cv.php';

$q = isset($_GET['q']) ? trim($_GET['q']) : '';
$categoryId = isset($_GET['categoryId']) ? (int)$_GET['categoryId'] : null;
$countryId = isset($_GET['countryId']) ? (int)$_GET['countryId'] : null;
$cityId = isset($_GET['cityId']) ? (int)$_GET['cityId'] : null;
$degreeLevelId = isset($_GET['degreeLevelId']) ? (int)$_GET['degreeLevelId'] : null;
$institutionId = isset($_GET['institutionId']) ? (int)$_GET['institutionId'] : null;
$minProficiencyId = isset($_GET['minProficiencyId']) ? (int)$_GET['minProficiencyId'] : null;
$sort = isset($_GET['sort']) ? strtolower(trim($_GET['sort'])) : 'recent';
$allowedSorts = ['recent', 'alpha', 'experience'];
if (!in_array($sort, $allowedSorts, true)) {
    $sort = 'recent';
}

$skillIds = [];
if (isset($_GET['skillIds'])) {
    if (is_array($_GET['skillIds'])) {
        $skillIds = array_map('intval', $_GET['skillIds']);
    } else {
        $skillIds = array_map('intval', explode(',', $_GET['skillIds']));
    }
    $skillIds = array_values(array_filter($skillIds, fn($v) => $v > 0));
}

$page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
$pageSize = isset($_GET['pageSize']) ? max(1, (int)$_GET['pageSize']) : 24;
$offset = ($page - 1) * $pageSize;

try {
    $where = [];
    $params = [];
    $types = '';

    $sql = "SELECT c.cv_id, c.user_id,
                   MAX(c.updated_at) AS updated_at,
                   SUM(
                       CASE
                           WHEN cwx.start_year IS NULL THEN 0
                           ELSE
                               GREATEST(
                                   0,
                                   (
                                       CASE
                                           WHEN cwx.is_present = 1 OR cwx.end_year IS NULL THEN YEAR(CURDATE())
                                           ELSE cwx.end_year
                                       END
                                   ) - cwx.start_year
                               )
                       END
                   ) AS exp_years
            FROM cvs c
            LEFT JOIN cv_addresses ca ON ca.cv_id = c.cv_id
            LEFT JOIN cv_education ce ON ce.cv_id = c.cv_id
            LEFT JOIN degree_levels dl ON ce.degree_level_id = dl.degree_level_id
            LEFT JOIN cv_skills cs ON cs.cv_id = c.cv_id
            LEFT JOIN proficiency_levels pl ON cs.proficiency_id = pl.proficiency_id
            LEFT JOIN skills s ON cs.skill_id = s.skill_id
            LEFT JOIN cv_work_history cwx ON cwx.cv_id = c.cv_id";

    if ($q !== '') {
        $sql .= " LEFT JOIN cv_work_history cw ON cw.cv_id = c.cv_id";
        $where[] = "(c.full_name LIKE ? OR c.summary LIKE ? OR cw.description LIKE ? OR ce.description LIKE ?)";
        $like = '%' . $conn->real_escape_string($q) . '%';
        // We still bind as parameters, real_escape_string is extra safety.
        for ($i = 0; $i < 4; $i++) {
            $params[] = $like;
            $types .= 's';
        }
    }

    if ($categoryId) {
        $where[] = "c.category_id = ?";
        $params[] = $categoryId;
        $types .= 'i';
    }

    if ($countryId) {
        $where[] = "ca.country_id = ?";
        $params[] = $countryId;
        $types .= 'i';
    }

    if ($cityId) {
        $where[] = "ca.city_id = ?";
        $params[] = $cityId;
        $types .= 'i';
    }

    if ($degreeLevelId) {
        $where[] = "ce.degree_level_id = ?";
        $params[] = $degreeLevelId;
        $types .= 'i';
    }

    if ($institutionId) {
        $where[] = "ce.institution_id = ?";
        $params[] = $institutionId;
        $types .= 'i';
    }

    if ($minProficiencyId) {
        $where[] = "pl.proficiency_id >= ?";
        $params[] = $minProficiencyId;
        $types .= 'i';
    }

    if (!empty($where)) {
        $sql .= " WHERE " . implode(' AND ', $where);
    }

    $sql .= " GROUP BY c.cv_id, c.user_id";

    if (!empty($skillIds)) {
        $placeholders = implode(',', array_fill(0, count($skillIds), '?'));
        $sql .= " HAVING SUM(CASE WHEN cs.skill_id IN ($placeholders) THEN 1 ELSE 0 END) >= " . count($skillIds);
        foreach ($skillIds as $id) {
            $params[] = $id;
            $types .= 'i';
        }
    }

    $orderBy = "c.updated_at DESC";
    if ($sort === 'alpha') {
        $orderBy = "c.full_name ASC";
    } elseif ($sort === 'experience') {
        $orderBy = "exp_years DESC, c.full_name ASC";
    }
    $sql .= " ORDER BY $orderBy LIMIT ? OFFSET ?";
    $params[] = $pageSize;
    $params[] = $offset;
    $types .= 'ii';

    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        throw new Exception('Failed to prepare statement');
    }

    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $userIds = [];
    while ($row = $result->fetch_assoc()) {
        $userIds[] = (int)$row['user_id'];
    }
    $stmt->close();

    $total = count($userIds);
    $results = [];

    foreach ($userIds as $uid) {
        $cv = fetchCv($conn, $uid);
        if ($cv && isset($cv['hasCv']) && $cv['hasCv']) {
            $results[] = $cv;
        }
    }

    echo json_encode([
        'results' => $results,
        'total' => $total,
        'page' => $page,
        'pageSize' => $pageSize,
    ]);
    exit;
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Search failed']);
    exit;
}

