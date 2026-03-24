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

$type = isset($_GET['type']) ? $_GET['type'] : null;

if (!$type) {
    http_response_code(400);
    echo json_encode(['error' => 'type is required']);
    exit;
}

function simpleLookup($conn, $table, $idCol, $nameCol) {
    $rows = [];
    $sql = "SELECT $idCol AS id, $nameCol AS name FROM $table ORDER BY $nameCol";
    $result = $conn->query($sql);
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $row['id'] = (int)$row['id'];
            $rows[] = $row;
        }
    }
    return $rows;
}

switch ($type) {
    case 'roles':
        $data = simpleLookup($conn, 'roles', 'role_id', 'role_name');
        break;
    case 'categories':
        $data = simpleLookup($conn, 'cv_categories', 'category_id', 'category_name');
        break;
    case 'countries':
        $data = simpleLookup($conn, 'countries', 'country_id', 'country_name');
        break;
    case 'cities':
        $countryId = isset($_GET['countryId']) ? (int)$_GET['countryId'] : null;
        $rows = [];
        $sql = "SELECT city_id AS id, city_name AS name FROM cities";
        if ($countryId) {
            $sql .= " WHERE country_id = $countryId";
        }
        $sql .= " ORDER BY city_name";
        $result = $conn->query($sql);
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $row['id'] = (int)$row['id'];
                $rows[] = $row;
            }
        }
        $data = $rows;
        break;
    case 'districts':
        $cityId = isset($_GET['cityId']) ? (int)$_GET['cityId'] : null;
        $rows = [];
        $sql = "SELECT district_id AS id, district_name AS name FROM districts";
        if ($cityId) {
            $sql .= " WHERE city_id = $cityId";
        }
        $sql .= " ORDER BY district_name";
        $result = $conn->query($sql);
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $row['id'] = (int)$row['id'];
                $rows[] = $row;
            }
        }
        $data = $rows;
        break;
    case 'degree-levels':
        $data = simpleLookup($conn, 'degree_levels', 'degree_level_id', 'degree_name');
        break;
    case 'majors':
        $data = simpleLookup($conn, 'majors', 'major_id', 'major_name');
        break;
    case 'institutions':
        $data = simpleLookup($conn, 'institutions', 'institution_id', 'institution_name');
        break;
    case 'job-titles':
        $data = simpleLookup($conn, 'job_titles', 'job_title_id', 'job_title');
        break;
    case 'employment-types':
        $data = simpleLookup($conn, 'employment_types', 'employment_type_id', 'employment_type');
        break;
    case 'industries':
        $data = simpleLookup($conn, 'industries', 'industry_id', 'industry_name');
        break;
    case 'skills':
        $data = simpleLookup($conn, 'skills', 'skill_id', 'skill_name');
        break;
    case 'proficiency-levels':
        $data = simpleLookup($conn, 'proficiency_levels', 'proficiency_id', 'level_name');
        break;
    case 'certificates':
        $data = simpleLookup($conn, 'certificates', 'certificate_id', 'certificate_name');
        break;
    case 'issuing-orgs':
        $data = simpleLookup($conn, 'issuing_organizations', 'issuing_org_id', 'organization_name');
        break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Unknown lookup type']);
        exit;
}

echo json_encode($data);
exit;

