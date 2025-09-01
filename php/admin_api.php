<?php

require_once 'db_config.php';

header('Content-Type: application/json');

$action = $_REQUEST['action'] ?? '';

switch ($action) {
    case 'getArtifacts':
        getArtifacts($conn);
        break;
    case 'getUsers':
        getUsers($conn);
        break;
    case 'getSystemLogs':
        getSystemLogs($conn);
        break;
    case 'getArtifact':
        getArtifact($conn);
        break;
    case 'getUser':
        getUser($conn);
        break;
    case 'addArtifact':
        addArtifact($conn);
        break;
    case 'addUser':
        addUser($conn);
        break;
    case 'updateArtifact':
        updateArtifact($conn);
        break;
    case 'deleteArtifact':
        deleteArtifact($conn);
        break;
    case 'updateUser':
        updateUser($conn);
        break;
    case 'deleteUser':
        deleteUser($conn);
        break;
    case 'register':
        registerUser($conn);
        break;
    case 'login':
        loginUser($conn);
        break;
    case 'add_log':
        add_log($conn);
        break;
    case 'logout':
        logout();
        break;
    case 'getDashboardStats':
        getDashboardStats($conn);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        break;
}

function getDashboardStats($conn) {
    $stats = [];

    // Total views
    $sql_views = "SELECT COUNT(*) as total_views FROM system_logs WHERE action = 'View Artifact'";
    $result_views = $conn->query($sql_views);
    $stats['total_views'] = $result_views->fetch_assoc()['total_views'];

    // Total photo uploads
    $sql_photos = "SELECT COUNT(*) as total_photos FROM artifact_images";
    $result_photos = $conn->query($sql_photos);
    $stats['total_photos'] = $result_photos->fetch_assoc()['total_photos'];

    echo json_encode(['success' => true, 'stats' => $stats]);
}

function logout() {
    session_start();
    session_unset();
    session_destroy();
    echo json_encode(['success' => true, 'message' => 'Logged out successfully.']);
}

function registerUser($conn) {
    error_log("Register function called.");
    $data = json_decode(file_get_contents("php://input"), true);
    error_log("Received data for register: " . print_r($data, true));
    $name = $data['name'] ?? '';
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';

    if (empty($name) || empty($email) || empty($password)) {
        error_log("Register: Missing required fields.");
        echo json_encode(['success' => false, 'message' => 'Please fill all required fields.']);
        return;
    }

    // Check if user already exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    if ($stmt === false) {
        error_log("Register: Prepare statement failed: " . $conn->error);
        echo json_encode(['success' => false, 'message' => 'Database error.']);
        return;
    }
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        error_log("Register: User with this email already exists.");
        echo json_encode(['success' => false, 'message' => 'User with this email already exists.']);
        $stmt->close();
        return;
    }
    $stmt->close();

    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $conn->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
    if ($stmt === false) {
        error_log("Register: Prepare statement failed for insert: " . $conn->error);
        echo json_encode(['success' => false, 'message' => 'Database error.']);
        return;
    }
    $stmt->bind_param("sss", $name, $email, $hashed_password);

    if ($stmt->execute()) {
        error_log("Register: User registered successfully.");
        echo json_encode(['success' => true, 'message' => 'Registration successful.']);
    } else {
        error_log("Register: Registration failed: " . $stmt->error);
        echo json_encode(['success' => false, 'message' => 'Registration failed.']);
    }
    $stmt->close();
}

function loginUser($conn) {
    error_log("Login function called.");
    $data = json_decode(file_get_contents("php://input"), true);
    error_log("Received data for login: " . print_r($data, true));
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';

    if (empty($email) || empty($password)) {
        error_log("Login: Missing email or password.");
        echo json_encode(['success' => false, 'message' => 'Please enter email and password.']);
        return;
    }

    $stmt = $conn->prepare("SELECT id, name, email, password, role FROM users WHERE email = ?");
    if ($stmt === false) {
        error_log("Login: Prepare statement failed: " . $conn->error);
        echo json_encode(['success' => false, 'message' => 'Database error.']);
        return;
    }
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        if (password_verify($password, $user['password'])) {
            error_log("Login: Password verified. User: " . $user['email']);
            $token = bin2hex(random_bytes(16));

            echo json_encode([
                'success' => true,
                'message' => 'Login successful.',
                'token' => $token,
                'user' => [
                    'id' => $user['id'],
                    'name' => $user['name'],
                    'email' => $user['email'],
                    'role' => $user['role']
                ]
            ]);
        } else {
            error_log("Login: Invalid password for user: " . $email);
            echo json_encode(['success' => false, 'message' => 'Invalid credentials.']);
        }
    } else {
        error_log("Login: User not found: " . $email);
        echo json_encode(['success' => false, 'message' => 'Invalid credentials.']);
    }
    $stmt->close();
}

function addArtifact($conn) {
    $collection_no = $_POST['collection_no'] ?? '';
    $accession_no = $_POST['accession_no'] ?? '';
    $collection_date = $_POST['collection_date'] ?? '';
    $donor = $_POST['donor'] ?? '';
    $object_type = $_POST['object_type'] ?? '';
    $object_head = $_POST['object_head'] ?? '';
    $description = $_POST['description'] ?? '';
    $measurement = $_POST['measurement'] ?? '';
    $gallery_no = $_POST['gallery_no'] ?? '';
    $found_place = $_POST['found_place'] ?? '';
    $experiment_formula = $_POST['experiment_formula'] ?? '';
    $significance_comment = $_POST['significance_comment'] ?? '';
    $correction = $_POST['correction'] ?? '';

    if (empty($collection_no) || empty($accession_no) || empty($collection_date) || empty($donor) || empty($object_type) || empty($object_head) || empty($description)) {
        echo json_encode(['success' => false, 'message' => 'Required fields are missing.']);
        return;
    }

    // Insert into artifacts table
    $sql_artifact = "INSERT INTO artifacts (collection_no, accession_no, collection_date, donor, object_type, object_head, description, measurement, gallery_no, found_place, experiment_formula, significance_comment, correction) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt_artifact = $conn->prepare($sql_artifact);
    $stmt_artifact->bind_param("sssssssssssss", $collection_no, $accession_no, $collection_date, $donor, $object_type, $object_head, $description, $measurement, $gallery_no, $found_place, $experiment_formula, $significance_comment, $correction);

    if ($stmt_artifact->execute()) {
        $artifact_id = $stmt_artifact->insert_id; // Get the ID of the newly inserted artifact

        // Handle image uploads
        if (isset($_FILES['images']) && is_array($_FILES['images']['name'])) {
            $target_dir = "../assets/images/";
            if (!file_exists($target_dir)) {
                mkdir($target_dir, 0777, true);
            }

            $uploaded_image_paths = [];
            foreach ($_FILES['images']['name'] as $key => $name) {
                if ($_FILES['images']['error'][$key] === UPLOAD_ERR_OK) {
                    $file_tmp_name = $_FILES['images']['tmp_name'][$key];
                    $file_extension = pathinfo($name, PATHINFO_EXTENSION);
                    $new_file_name = uniqid('img_') . '.' . $file_extension; // Generate unique filename
                    $target_file = $target_dir . $new_file_name;

                    if (move_uploaded_file($file_tmp_name, $target_file)) {
                        $uploaded_image_paths[] = $new_file_name;
                    } else {
                        // Log error if file move fails
                        error_log("Failed to move uploaded file: " . $file_tmp_name . " to " . $target_file);
                    }
                } else {
                    // Log file upload error
                    error_log("File upload error for " . $name . ": " . $_FILES['images']['error'][$key]);
                }
            }

            // Insert image paths into artifact_images table
            if (!empty($uploaded_image_paths)) {
                $sql_images = "INSERT INTO artifact_images (artifact_id, image_path) VALUES (?, ?)";
                $stmt_images = $conn->prepare($sql_images);
                foreach ($uploaded_image_paths as $image_path) {
                    $stmt_images->bind_param("is", $artifact_id, $image_path);
                    $stmt_images->execute();
                }
                $stmt_images->close();
            }
        }

        echo json_encode(['success' => true, 'message' => 'Artifact added successfully.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to add artifact: ' . $stmt_artifact->error]);
    }
    $stmt_artifact->close();
}

function addUser($conn) {
    $name = $_POST['name'] ?? '';
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    $role = $_POST['role'] ?? 'user';

    // Basic validation
    if (empty($name) || empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Required fields are missing.']);
        return;
    }

    // Hash the password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    $sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssss", $name, $email, $hashed_password, $role);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'User added successfully.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to add user: ' . $stmt->error]);
    }
    $stmt->close();
}

function getArtifacts($conn) {
    $search_query = $_GET['search_query'] ?? '';
    $type_filter = $_GET['type_filter'] ?? '';
    $date_filter = $_GET['date_filter'] ?? '';

    $sql = "SELECT a.*, GROUP_CONCAT(ai.image_path ORDER BY ai.id ASC) AS images FROM artifacts a LEFT JOIN artifact_images ai ON a.id = ai.artifact_id";
    $where_clauses = [];
    $params = [];
    $param_types = "";

    if (!empty($search_query)) {
        $where_clauses[] = "(a.collection_no LIKE ? OR a.accession_no LIKE ? OR a.object_head LIKE ? OR a.description LIKE ? OR a.donor LIKE ?)";
        $search_param = "%" . $search_query . "%";
        $params = array_merge($params, [$search_param, $search_param, $search_param, $search_param, $search_param]);
        $param_types .= "sssss";
    }

    if (!empty($type_filter)) {
        $where_clauses[] = "a.object_type = ?";
        $params[] = $type_filter;
        $param_types .= "s";
    }

    if (!empty($date_filter)) {
        if ($date_filter === 'today') {
            $where_clauses[] = "DATE(a.created_at) = CURDATE()";
        } elseif ($date_filter === 'week') {
            $where_clauses[] = "YEARWEEK(a.created_at, 1) = YEARWEEK(CURDATE(), 1)";
        } elseif ($date_filter === 'month') {
            $where_clauses[] = "MONTH(a.created_at) = MONTH(CURDATE()) AND YEAR(a.created_at) = YEAR(CURDATE())";
        } else {
            $where_clauses[] = "DATE(a.created_at) = ?";
            $params[] = $date_filter;
            $param_types .= "s";
        }
    }

    if (count($where_clauses) > 0) {
        $sql .= " WHERE " . implode(" AND ", $where_clauses);
    }

    $sql .= " GROUP BY a.id ORDER BY a.created_at DESC"; // Group by artifact ID to get one row per artifact

    $stmt = $conn->prepare($sql);

    if (!empty($params)) {
        $bind_names = [$param_types];
        foreach ($params as $key => $value) {
            $bind_names[] = &$params[$key];
        }
        call_user_func_array([$stmt, 'bind_param'], $bind_names);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $artifacts = [];
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $artifacts[] = $row;
        }
    }
    echo json_encode($artifacts); 
    $stmt->close();
}

function getUsers($conn) {
    $sql = "SELECT id, name, email, role, created_at FROM users"; // Exclude password for security
    $result = $conn->query($sql);

    $users = [];
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $users[] = $row;
        }
    }
  echo json_encode($users);  
}

function getSystemLogs($conn) {
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $filter = isset($_GET['filter']) ? $_GET['filter'] : '';
    $limit = 10; // Logs per page
    $offset = ($page - 1) * $limit;

    $where_clauses = [];
    $params = [];
    $param_types = "";

    if (!empty($filter)) {
        $where_clauses[] = "sl.action = ?";
        $params[] = $filter;
        $param_types .= "s";
    }

    $count_sql = "SELECT COUNT(*) as total FROM system_logs sl";
    if (!empty($where_clauses)) {
        $count_sql .= " WHERE " . implode(" AND ", $where_clauses);
    }

    $stmt_count = $conn->prepare($count_sql);
    if (!empty($params)) {
        $stmt_count->bind_param($param_types, ...$params);
    }
    $stmt_count->execute();
    $result_count = $stmt_count->get_result();
    $total_logs = $result_count->fetch_assoc()['total'];
    $total_pages = ceil($total_logs / $limit);

    $sql = "SELECT sl.id, u.name as user_name, sl.action, sl.details, sl.created_at FROM system_logs sl LEFT JOIN users u ON sl.user_id = u.id";
    if (!empty($where_clauses)) {
        $sql .= " WHERE " . implode(" AND ", $where_clauses);
    }
    $sql .= " ORDER BY sl.created_at DESC LIMIT ? OFFSET ?";

    $stmt = $conn->prepare($sql);
    $param_types .= 'ii';
    $params[] = $limit;
    $params[] = $offset;
    if (!empty($params)) {
        $stmt->bind_param($param_types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();

    $logs = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $logs[] = $row;
        }
        echo json_encode(['logs' => $logs, 'totalPages' => $total_pages]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to fetch logs']);
    }
}

function getArtifact($conn) {
    $id = $_GET['id'] ?? 0;
    $sql = "SELECT a.*, GROUP_CONCAT(ai.image_path ORDER BY ai.id ASC) AS images FROM artifacts a LEFT JOIN artifact_images ai ON a.id = ai.artifact_id WHERE a.id = ? GROUP BY a.id";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        echo json_encode($result->fetch_assoc());
    } else {
        echo json_encode(['success' => false, 'message' => 'Artifact not found']);
    }
    $stmt->close();
}

function getUser($conn) {
    $id = $_GET['id'] ?? 0;
    $sql = "SELECT id, name, email, role, created_at FROM users WHERE id = ?"; // Exclude password
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        echo json_encode($result->fetch_assoc());
    } else {
        echo json_encode(['success' => false, 'message' => 'User not found']);
    }
    $stmt->close();
}


function updateArtifact($conn) {
    $id = $_POST['id'] ?? '';
    $collection_no = $_POST['collection_no'] ?? '';
    $accession_no = $_POST['accession_no'] ?? '';
    $collection_date = $_POST['collection_date'] ?? '';
    $donor = $_POST['donor'] ?? '';
    $object_type = $_POST['object_type'] ?? '';
    $object_head = $_POST['object_head'] ?? '';
    $description = $_POST['description'] ?? '';
    $measurement = $_POST['measurement'] ?? '';
    $gallery_no = $_POST['gallery_no'] ?? '';
    $found_place = $_POST['found_place'] ?? '';
    $experiment_formula = $_POST['experiment_formula'] ?? '';
    $significance_comment = $_POST['significance_comment'] ?? '';
    $correction = $_POST['correction'] ?? '';

    if (empty($id) || empty($collection_no) || empty($accession_no) || empty($collection_date) || empty($donor) || empty($object_type) || empty($object_head) || empty($description)) {
        echo json_encode(['success' => false, 'message' => 'Required fields are missing.']);
        return;
    }

    // Update artifacts table
    $sql_artifact = "UPDATE artifacts SET collection_no=?, accession_no=?, collection_date=?, donor=?, object_type=?, object_head=?, description=?, measurement=?, gallery_no=?, found_place=?, experiment_formula=?, significance_comment=?, correction=? WHERE id=?";
    $stmt_artifact = $conn->prepare($sql_artifact);
    $stmt_artifact->bind_param("sssssssssssssi", $collection_no, $accession_no, $collection_date, $donor, $object_type, $object_head, $description, $measurement, $gallery_no, $found_place, $experiment_formula, $significance_comment, $correction, $id);

    if ($stmt_artifact->execute()) {
        // Handle image uploads for update
        if (isset($_FILES['images']) && is_array($_FILES['images']['name']) && !empty($_FILES['images']['name'][0])) {
            // Delete existing images for this artifact from artifact_images table
            $sql_delete_images = "DELETE FROM artifact_images WHERE artifact_id = ?";
            $stmt_delete_images = $conn->prepare($sql_delete_images);
            $stmt_delete_images->bind_param("i", $id);
            $stmt_delete_images->execute();
            $stmt_delete_images->close();

            $target_dir = "../assets/images/";
            if (!file_exists($target_dir)) {
                mkdir($target_dir, 0777, true);
            }

            $uploaded_image_paths = [];
            foreach ($_FILES['images']['name'] as $key => $name) {
                if ($_FILES['images']['error'][$key] === UPLOAD_ERR_OK) {
                    $file_tmp_name = $_FILES['images']['tmp_name'][$key];
                    $file_extension = pathinfo($name, PATHINFO_EXTENSION);
                    $new_file_name = uniqid('img_') . '.' . $file_extension; // Generate unique filename
                    $target_file = $target_dir . $new_file_name;

                    if (move_uploaded_file($file_tmp_name, $target_file)) {
                        $uploaded_image_paths[] = $new_file_name;
                    } else {
                        error_log("Failed to move uploaded file during update: " . $file_tmp_name . " to " . $target_file);
                    }
                } else {
                    error_log("File upload error during update for " . $name . ": " . $_FILES['images']['error'][$key]);
                }
            }

            // Insert new image paths into artifact_images table
            if (!empty($uploaded_image_paths)) {
                $sql_insert_images = "INSERT INTO artifact_images (artifact_id, image_path) VALUES (?, ?)";
                $stmt_insert_images = $conn->prepare($sql_insert_images);
                foreach ($uploaded_image_paths as $image_path) {
                    $stmt_insert_images->bind_param("is", $id, $image_path);
                    $stmt_insert_images->execute();
                }
                $stmt_insert_images->close();
            }
        }

        echo json_encode(['success' => true, 'message' => 'Artifact updated successfully.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update artifact: ' . $stmt_artifact->error]);
    }
    $stmt_artifact->close();
}

function deleteArtifact($conn) {
    $id = $_POST['id'] ?? '';

    if (empty($id)) {
        echo json_encode(['success' => false, 'message' => 'Artifact ID is missing.']);
        return;
    }

    // Start a transaction to ensure both deletions succeed or fail together
    $conn->begin_transaction();

    try {
        // First, delete associated images from artifact_images table
        $sql_delete_images = "DELETE FROM artifact_images WHERE artifact_id = ?";
        $stmt_delete_images = $conn->prepare($sql_delete_images);
        $stmt_delete_images->bind_param("i", $id);
        $stmt_delete_images->execute();
        $stmt_delete_images->close();

        // Then, delete the artifact from the artifacts table
        $sql_delete_artifact = "DELETE FROM artifacts WHERE id=?";
        $stmt_delete_artifact = $conn->prepare($sql_delete_artifact);
        $stmt_delete_artifact->bind_param("i", $id);

        if ($stmt_delete_artifact->execute()) {
            $conn->commit(); // Commit the transaction
            echo json_encode(['success' => true, 'message' => 'Artifact and associated images deleted successfully.']);
        } else {
            $conn->rollback(); 

            echo json_encode(['success' => false, 'message' => 'Failed to delete artifact: ' . $stmt_delete_artifact->error]);
        }
        $stmt_delete_artifact->close();
    } catch (mysqli_sql_exception $e) {
        $conn->rollback(); // Rollback on exception
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
}

function updateUser($conn) {
    $id = $_POST['id'] ?? '';
    $name = $_POST['name'] ?? '';
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? ''; // Password might be optional or hashed if provided
    $role = $_POST['role'] ?? '';

    if (empty($id) || empty($name) || empty($email) || empty($role)) {
        echo json_encode(['success' => false, 'message' => 'Required fields are missing.']);
        return;
    }

    $allowed_roles = ['user', 'admin'];
    if (!in_array($role, $allowed_roles)) {
        echo json_encode(['success' => false, 'message' => 'Invalid role.']);
        return;
    }

    $sql = "UPDATE users SET name=?, email=?, role=?";
    $params = [&$name, &$email, &$role];
    $param_types = "sss";

    if (!empty($password)) {
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        $sql .= ", password=?";
        $params[] = &$hashed_password;
        $param_types .= "s";
    }

    $sql .= " WHERE id=?";
    $params[] = &$id;
    $param_types .= "i";

    $stmt = $conn->prepare($sql);
    call_user_func_array([$stmt, 'bind_param'], array_merge([$param_types], $params));

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'User updated successfully.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update user: ' . $stmt->error]);
    }
    $stmt->close();
}

function deleteUser($conn) {
    $id = $_POST['id'] ?? '';

    if (empty($id)) {
        echo json_encode(['success' => false, 'message' => 'User ID is missing.']);
        return;
    }

    $sql = "DELETE FROM users WHERE id=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'User deleted successfully.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to delete user: ' . $stmt->error]);
    }
    $stmt->close();
}

function add_log($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    $user_id = isset($data['user_id']) ? $data['user_id'] : null;
    $log_action = isset($data['action']) ? $data['action'] : null;
    $details = isset($data['details']) ? $data['details'] : null;

    if ($log_action) {
        $stmt = $conn->prepare("INSERT INTO system_logs (user_id, action, details) VALUES (?, ?, ?)");
        $stmt->bind_param("iss", $user_id, $log_action, $details);
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to add log']);
        }
        $stmt->close();
    } else {
        echo json_encode(['success' => false, 'message' => 'Action is required']);
    }
}

$conn->close();
?>