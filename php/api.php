<?php
include 'db_config.php';

header('Content-Type: application/json');

$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {
    case 'get_artifacts':
        getArtifacts($conn);
        break;
    case 'search_artifacts':
        searchArtifacts($conn);
        break;
    case 'get_top_visited_artifacts':
        getTopVisitedArtifacts($conn);
        break;
    case 'get_slideshow_images':
        getSlideshowImages($conn);
        break;
    case 'get_artifact_by_id':
        getArtifactById($conn);
        break;
    default:
        echo json_encode(['error' => 'Invalid action']);
        break;
}

function getArtifacts($conn) {
    $sql = "SELECT a.*, GROUP_CONCAT(ai.image_path) AS images 
            FROM artifacts a 
            LEFT JOIN artifact_images ai ON a.id = ai.artifact_id 
            GROUP BY a.id";
    $result = $conn->query($sql);

    $artifacts = [];
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $row['images'] = $row['images'] ? explode(',', $row['images']) : [];
            $artifacts[] = $row;
        }
    }

    echo json_encode($artifacts);
}

function getTopVisitedArtifacts($conn) {
    // In a real application, this would involve a 'views' column and ordering by it.
    // For now, we'll just fetch a limited number of artifacts.
    $sql = "SELECT a.*, GROUP_CONCAT(ai.image_path) AS images 
            FROM artifacts a 
            LEFT JOIN artifact_images ai ON a.id = ai.artifact_id 
            GROUP BY a.id 
            ORDER BY a.created_at DESC LIMIT 6"; // Example: show 6 most recent artifacts
    $result = $conn->query($sql);

    $artifacts = [];
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $row['images'] = $row['images'] ? explode(',', $row['images']) : [];
            $artifacts[] = $row;
        }
    }

    echo json_encode($artifacts);
}

function getSlideshowImages($conn) {
    $sql = "SELECT image_path, caption FROM slideshow_images ORDER BY id ASC";
    $result = $conn->query($sql);

    $images = [];
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $images[] = $row;
        }
    }

    echo json_encode($images);
}

function searchArtifacts($conn) {
    $search_type = isset($_GET['type']) ? $_GET['type'] : '';
    $search_value = isset($_GET['value']) ? $_GET['value'] : '';
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10; // Default limit

    $offset = ($page - 1) * $limit;

    $where_clauses = [];
    $params = [];
    $param_types = "";

    if (!empty($search_type) && !empty($search_value)) {
        $allowed_types = ['collection_no', 'accession_no', 'donor', 'object_type', 'object_head', 'collection_date', 'description'];
        if (!in_array($search_type, $allowed_types)) {
            echo json_encode(['error' => 'Invalid search type']);
            return;
        }
        $where_clauses[] = "a.`" . $search_type . "` LIKE ?";
        $search_param = "%" . $search_value . "%";
        $params[] = $search_param;
        $param_types .= "s";
    }

    // Count total artifacts for pagination
    $count_sql = "SELECT COUNT(DISTINCT a.id) AS total_count FROM artifacts a";
    if (!empty($where_clauses)) {
        $count_sql .= " WHERE " . implode(" AND ", $where_clauses);
    }

    $count_stmt = $conn->prepare($count_sql);
    if (!empty($params)) {
        $bind_names = [$param_types];
        foreach ($params as $key => $value) {
            $bind_names[] = &$params[$key];
        }
        call_user_func_array([$count_stmt, 'bind_param'], $bind_names);
    }
    $count_stmt->execute();
    $total_count_result = $count_stmt->get_result()->fetch_assoc();
    $total_artifacts = $total_count_result['total_count'];
    $count_stmt->close();

    $sql = "SELECT a.*, GROUP_CONCAT(ai.image_path) AS images 
            FROM artifacts a 
            LEFT JOIN artifact_images ai ON a.id = ai.artifact_id ";
    if (!empty($where_clauses)) {
        $sql .= " WHERE " . implode(" AND ", $where_clauses);
    }
    $sql .= " GROUP BY a.id LIMIT ? OFFSET ?";

    $stmt = $conn->prepare($sql);
    
    // Add limit and offset parameters to the binding
    $param_types .= "ii";
    $params[] = $limit;
    $params[] = $offset;

    if (!empty($params)) {
        $bind_names = [$param_types];
        for ($i = 0; $i < count($params); $i++) {
            $bind_names[] = &$params[$i];
        }
        call_user_func_array([$stmt, 'bind_param'], $bind_names);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $artifacts = [];
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $row['images'] = $row['images'] ? explode(',', $row['images']) : [];
            $artifacts[] = $row;
        }
    }

    echo json_encode([
        'artifacts' => $artifacts,
        'total_artifacts' => $total_artifacts,
        'current_page' => $page,
        'per_page' => $limit
    ]);
    $stmt->close();
}

function getArtifactById($conn) {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

    if ($id <= 0) {
        echo json_encode(['error' => 'Invalid artifact ID']);
        return;
    }

    $sql = "SELECT a.*, GROUP_CONCAT(ai.image_path) AS images 
            FROM artifacts a 
            LEFT JOIN artifact_images ai ON a.id = ai.artifact_id 
            WHERE a.id = ?
            GROUP BY a.id";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();

    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $artifact = $result->fetch_assoc();
        $artifact['images'] = $artifact['images'] ? explode(',', $artifact['images']) : [];
        echo json_encode($artifact);
    } else {
        echo json_encode(['error' => 'Artifact not found']);
    }
    $stmt->close();
}

$conn->close();
?>