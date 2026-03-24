<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/database.php';

function getUserId() {
    if (isset($_GET['user_id'])) {
        return (int)$_GET['user_id'];
    }
    // Default for now
    return 1;
}

function fetchCv($conn, $userId) {
    $cvSql = "SELECT c.*, cat.category_name 
              FROM cvs c
              LEFT JOIN cv_categories cat ON c.category_id = cat.category_id
              WHERE c.user_id = $userId
              LIMIT 1";
    $cvResult = $conn->query($cvSql);
    if (!$cvResult || $cvResult->num_rows === 0) {
        return ['hasCv' => false];
    }

    $cv = $cvResult->fetch_assoc();
    $cvId = (int)$cv['cv_id'];

    // Address
    $address = null;
    $addrSql = "SELECT a.*, co.country_name, ci.city_name, d.district_name
                FROM cv_addresses a
                LEFT JOIN countries co ON a.country_id = co.country_id
                LEFT JOIN cities ci ON a.city_id = ci.city_id
                LEFT JOIN districts d ON a.district_id = d.district_id
                WHERE a.cv_id = $cvId
                LIMIT 1";
    $addrResult = $conn->query($addrSql);
    if ($addrResult && $addrResult->num_rows === 1) {
        $row = $addrResult->fetch_assoc();
        $address = [
            'addressId' => (int)$row['address_id'],
            'countryId' => (int)$row['country_id'],
            'cityId' => (int)$row['city_id'],
            'districtId' => (int)$row['district_id'],
            'country' => $row['country_name'],
            'city' => $row['city_name'],
            'district' => $row['district_name'],
            'streetAddress' => $row['street_address'],
            'postalCode' => $row['postal_code'],
        ];
    } else {
        $address = [
            'addressId' => null,
            'countryId' => null,
            'cityId' => null,
            'districtId' => null,
            'country' => '',
            'city' => '',
            'district' => '',
            'streetAddress' => '',
            'postalCode' => '',
        ];
    }

    // Education
    $education = [];
    $eduSql = "SELECT e.*, i.institution_name, d.degree_name, m.major_name
               FROM cv_education e
               LEFT JOIN institutions i ON e.institution_id = i.institution_id
               LEFT JOIN degree_levels d ON e.degree_level_id = d.degree_level_id
               LEFT JOIN majors m ON e.major_id = m.major_id
               WHERE e.cv_id = $cvId
               ORDER BY e.start_year";
    $eduResult = $conn->query($eduSql);
    if ($eduResult) {
        while ($row = $eduResult->fetch_assoc()) {
            $education[] = [
                'id' => (string)$row['education_id'],
                'educationId' => (int)$row['education_id'],
                'institutionId' => (int)$row['institution_id'],
                'degreeLevelId' => (int)$row['degree_level_id'],
                'majorId' => (int)$row['major_id'],
                'institutions' => $row['institution_name'],
                'degreeLevel' => $row['degree_name'],
                'major' => $row['major_name'],
                'startYear' => $row['start_year'] ? (string)$row['start_year'] : '',
                'endYear' => $row['end_year'] ? (string)$row['end_year'] : '',
                'description' => $row['description'],
            ];
        }
    }

    // Work history
    $work = [];
    $workSql = "SELECT w.*, jt.job_title, et.employment_type, ind.industry_name
                FROM cv_work_history w
                LEFT JOIN job_titles jt ON w.job_title_id = jt.job_title_id
                LEFT JOIN employment_types et ON w.employment_type_id = et.employment_type_id
                LEFT JOIN industries ind ON w.industry_id = ind.industry_id
                WHERE w.cv_id = $cvId
                ORDER BY w.start_year";
    $workResult = $conn->query($workSql);
    if ($workResult) {
        while ($row = $workResult->fetch_assoc()) {
            $work[] = [
                'id' => (string)$row['work_id'],
                'workId' => (int)$row['work_id'],
                'companyName' => $row['company_name'],
                'jobTitle' => $row['job_title'],
                'employmentType' => $row['employment_type'],
                'industry' => $row['industry_name'],
                'jobTitleId' => (int)$row['job_title_id'],
                'employmentTypeId' => (int)$row['employment_type_id'],
                'industryId' => (int)$row['industry_id'],
                'startYear' => $row['start_year'] ? (string)$row['start_year'] : '',
                'endYear' => $row['end_year'] ? (string)$row['end_year'] : '',
                'isPresent' => (bool)$row['is_present'],
                'description' => $row['description'],
            ];
        }
    }

    // Skills
    $skills = [];
    $skillsSql = "SELECT cs.*, s.skill_name, p.level_name
                  FROM cv_skills cs
                  LEFT JOIN skills s ON cs.skill_id = s.skill_id
                  LEFT JOIN proficiency_levels p ON cs.proficiency_id = p.proficiency_id
                  WHERE cs.cv_id = $cvId";
    $skillsResult = $conn->query($skillsSql);
    if ($skillsResult) {
        while ($row = $skillsResult->fetch_assoc()) {
            $skills[] = [
                'id' => (string)$row['cv_skill_id'],
                'cvSkillId' => (int)$row['cv_skill_id'],
                'skillId' => (int)$row['skill_id'],
                'proficiencyId' => (int)$row['proficiency_id'],
                'skill' => $row['skill_name'],
                'proficiency' => $row['level_name'],
            ];
        }
    }

    // Certificates
    $certificates = [];
    $certSql = "SELECT cc.*, c.certificate_name, io.organization_name
                FROM cv_certificates cc
                LEFT JOIN certificates c ON cc.certificate_id = c.certificate_id
                LEFT JOIN issuing_organizations io ON cc.issuing_org_id = io.issuing_org_id
                WHERE cc.cv_id = $cvId";
    $certResult = $conn->query($certSql);
    if ($certResult) {
        while ($row = $certResult->fetch_assoc()) {
            $certificates[] = [
                'id' => (string)$row['cv_certificate_id'],
                'cvCertificateId' => (int)$row['cv_certificate_id'],
                'certificateId' => (int)$row['certificate_id'],
                'issuingOrgId' => (int)$row['issuing_org_id'],
                'certificate' => $row['certificate_name'],
                'issuingOrganization' => $row['organization_name'],
                'issuedYear' => $row['issued_year'] ? (string)$row['issued_year'] : '',
                'description' => $row['description'],
            ];
        }
    }

    $personalGender = strtolower($cv['gender']) === 'female' ? 'female' : (strtolower($cv['gender']) === 'male' ? 'male' : '');

    return [
        'hasCv' => true,
        'cvId' => $cvId,
        'userId' => (int)$cv['user_id'],
        'categoryId' => (int)$cv['category_id'],
        'categoryName' => $cv['category_name'],
        'personal' => [
            'fullName' => $cv['full_name'],
            'email' => $cv['email'],
            'phone' => $cv['phone'],
            'bio' => $cv['summary'],
            'dateOfBirth' => $cv['date_of_birth'],
            'gender' => $personalGender,
        ],
        'address' => $address,
        'education' => $education,
        'work' => $work,
        'skills' => $skills,
        'certificates' => $certificates,
    ];
}

function fetchAllCvs($conn) {
    $rows = [];
    $sql = "SELECT DISTINCT user_id FROM cvs";
    $result = $conn->query($sql);
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $userId = (int)$row['user_id'];
            $rows[] = fetchCv($conn, $userId);
        }
    }
    return $rows;
}

// Only handle HTTP requests when this file is the main entry script.
if (basename(__FILE__) === basename($_SERVER['SCRIPT_FILENAME'])) {

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['all']) && $_GET['all'] === '1') {
        echo json_encode(fetchAllCvs($conn));
        exit;
    }
    $userId = getUserId();
    echo json_encode(fetchCv($conn, $userId));
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || !isset($input['userId'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid payload']);
        exit;
    }

    $userId = (int)$input['userId'];
    $categoryId = isset($input['categoryId']) ? (int)$input['categoryId'] : 1;

    $personal = $input['personal'];
    $address = $input['address'];
    $education = isset($input['education']) && is_array($input['education']) ? $input['education'] : [];
    $work = isset($input['work']) && is_array($input['work']) ? $input['work'] : [];
    $skills = isset($input['skills']) && is_array($input['skills']) ? $input['skills'] : [];
    $certificates = isset($input['certificates']) && is_array($input['certificates']) ? $input['certificates'] : [];

    if (count($skills) > 5) {
        $skills = array_slice($skills, 0, 5);
    }

    $conn->begin_transaction();

    try {
        // Upsert CV
        $gender = '';
        if (isset($personal['gender'])) {
            if ($personal['gender'] === 'male') $gender = 'Male';
            if ($personal['gender'] === 'female') $gender = 'Female';
        }

        $fullName = $conn->real_escape_string($personal['fullName']);
        $email = $conn->real_escape_string($personal['email']);
        $phone = $conn->real_escape_string($personal['phone']);
        $summary = $conn->real_escape_string($personal['bio']);
        $dob = $personal['dateOfBirth'] ? "'" . $conn->real_escape_string($personal['dateOfBirth']) . "'" : 'NULL';

        $cvId = null;
        $checkSql = "SELECT cv_id FROM cvs WHERE user_id = $userId LIMIT 1";
        $checkResult = $conn->query($checkSql);
        if ($checkResult && $checkResult->num_rows === 1) {
            $row = $checkResult->fetch_assoc();
            $cvId = (int)$row['cv_id'];
            $updateSql = "UPDATE cvs 
                          SET category_id = $categoryId,
                              full_name = '$fullName',
                              date_of_birth = $dob,
                              gender = '$gender',
                              email = '$email',
                              phone = '$phone',
                              summary = '$summary'
                          WHERE cv_id = $cvId";
            $conn->query($updateSql);
        } else {
            $insertSql = "INSERT INTO cvs (user_id, category_id, full_name, date_of_birth, gender, email, phone, summary) 
                          VALUES ($userId, $categoryId, '$fullName', $dob, '$gender', '$email', '$phone', '$summary')";
            $conn->query($insertSql);
            $cvId = (int)$conn->insert_id;
        }

        // Upsert address (single row per CV)
        $street = $conn->real_escape_string($address['streetAddress']);
        $postal = $conn->real_escape_string($address['postalCode']);
        $countryId = isset($address['countryId']) ? (int)$address['countryId'] : 'NULL';
        $cityId = isset($address['cityId']) ? (int)$address['cityId'] : 'NULL';
        $districtId = isset($address['districtId']) ? (int)$address['districtId'] : 'NULL';

        $addrCheck = $conn->query("SELECT address_id FROM cv_addresses WHERE cv_id = $cvId LIMIT 1");
        if ($addrCheck && $addrCheck->num_rows === 1) {
            $row = $addrCheck->fetch_assoc();
            $addrId = (int)$row['address_id'];
            $addrSql = "UPDATE cv_addresses 
                        SET country_id = $countryId,
                            city_id = $cityId,
                            district_id = $districtId,
                            street_address = '$street',
                            postal_code = '$postal'
                        WHERE address_id = $addrId";
            $conn->query($addrSql);
        } else {
            $addrSql = "INSERT INTO cv_addresses (cv_id, country_id, city_id, district_id, street_address, postal_code)
                        VALUES ($cvId, $countryId, $cityId, $districtId, '$street', '$postal')";
            $conn->query($addrSql);
        }

        // Replace education/work/skills/certificates for simplicity
        $conn->query("DELETE FROM cv_education WHERE cv_id = $cvId");
        foreach ($education as $e) {
            $instId = isset($e['institutionId']) ? (int)$e['institutionId'] : 'NULL';
            $degId = isset($e['degreeLevelId']) ? (int)$e['degreeLevelId'] : 'NULL';
            $majId = isset($e['majorId']) ? (int)$e['majorId'] : 'NULL';
            $startYear = !empty($e['startYear']) ? "'" . $conn->real_escape_string($e['startYear']) . "'" : 'NULL';
            $endYear = !empty($e['endYear']) ? "'" . $conn->real_escape_string($e['endYear']) . "'" : 'NULL';
            $desc = isset($e['description']) ? $conn->real_escape_string($e['description']) : '';
            $sql = "INSERT INTO cv_education (cv_id, institution_id, degree_level_id, major_id, start_year, end_year, description)
                    VALUES ($cvId, $instId, $degId, $majId, $startYear, $endYear, '$desc')";
            $conn->query($sql);
        }

        $conn->query("DELETE FROM cv_work_history WHERE cv_id = $cvId");
        foreach ($work as $w) {
            $company = $conn->real_escape_string($w['companyName']);
            $jobTitleId = isset($w['jobTitleId']) ? (int)$w['jobTitleId'] : 'NULL';
            $empTypeId = isset($w['employmentTypeId']) ? (int)$w['employmentTypeId'] : 'NULL';
            $industryId = isset($w['industryId']) ? (int)$w['industryId'] : 'NULL';
            $startYear = !empty($w['startYear']) ? "'" . $conn->real_escape_string($w['startYear']) . "'" : 'NULL';
            $endYear = !empty($w['endYear']) ? "'" . $conn->real_escape_string($w['endYear']) . "'" : 'NULL';
            $isPresent = !empty($w['isPresent']) ? 1 : 0;
            $desc = isset($w['description']) ? $conn->real_escape_string($w['description']) : '';
            $sql = "INSERT INTO cv_work_history (cv_id, company_name, job_title_id, employment_type_id, industry_id, start_year, end_year, is_present, description)
                    VALUES ($cvId, '$company', $jobTitleId, $empTypeId, $industryId, $startYear, $endYear, $isPresent, '$desc')";
            $conn->query($sql);
        }

        $conn->query("DELETE FROM cv_skills WHERE cv_id = $cvId");
        $seenSkills = [];
        foreach ($skills as $s) {
            if (!isset($s['skillId']) || !isset($s['proficiencyId'])) {
                continue;
            }
            $skillId = (int)$s['skillId'];
            if (in_array($skillId, $seenSkills, true)) {
                continue;
            }
            $seenSkills[] = $skillId;
            $profId = (int)$s['proficiencyId'];
            $sql = "INSERT INTO cv_skills (cv_id, skill_id, proficiency_id)
                    VALUES ($cvId, $skillId, $profId)";
            $conn->query($sql);
        }

        $conn->query("DELETE FROM cv_certificates WHERE cv_id = $cvId");
        foreach ($certificates as $c) {
            if (!isset($c['certificateId']) || !isset($c['issuingOrgId'])) {
                continue;
            }
            $certId = (int)$c['certificateId'];
            $orgId = (int)$c['issuingOrgId'];
            $year = !empty($c['issuedYear']) ? "'" . $conn->real_escape_string($c['issuedYear']) . "'" : 'NULL';
            $desc = isset($c['description']) ? $conn->real_escape_string($c['description']) : '';
            $sql = "INSERT INTO cv_certificates (cv_id, certificate_id, issuing_org_id, issued_year, description)
                    VALUES ($cvId, $certId, $orgId, $year, '$desc')";
            $conn->query($sql);
        }

        $conn->commit();

        echo json_encode([
            'success' => true,
            'cvId' => $cvId,
            'message' => 'CV saved successfully',
        ]);
        exit;
    } catch (Exception $e) {
        $conn->rollback();
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to save CV']);
        exit;
    }
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
exit;

}

