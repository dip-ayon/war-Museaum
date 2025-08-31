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

function searchArtifacts($conn) {
    $search_type = isset($_GET['type']) ? $_GET['type'] : '';
    $search_value = isset($_GET['value']) ? $_GET['value'] : '';

    if (empty($search_type) || empty($search_value)) {
        echo json_encode(['error' => 'Search type and value are required']);
        return;
    }

    $allowed_types = ['collection_no', 'accession_no', 'donor', 'object_type', 'object_head'];
    if (!in_array($search_type, $allowed_types)) {
        echo json_encode(['error' => 'Invalid search type']);
        return;
    }

    $sql = "SELECT a.*, GROUP_CONCAT(ai.image_path) AS images 
            FROM artifacts a 
            LEFT JOIN artifact_images ai ON a.id = ai.artifact_id 
            WHERE a.`" . $search_type . "` LIKE ?
            GROUP BY a.id";

    $stmt = $conn->prepare($sql);
    $search_param = "%" . $search_value . "%";
    $stmt->bind_param("s", $search_param);
    $stmt->execute();

    $result = $stmt->get_result();

    $artifacts = [];
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $row['images'] = $row['images'] ? explode(',', $row['images']) : [];
            $artifacts[] = $row;
        }
    }

    echo json_encode($artifacts);
}

$conn->close();
?>
