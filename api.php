<?php
header('Content-Type: application/json');

// Konfigurasi koneksi database
$host = "localhost";
$user = "root";
$pass = "";
$db   = "db_devclub";

$conn = @new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Koneksi database gagal!"]);
    exit();
}

$conn->set_charset("utf8mb4");

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

// Hanya izinkan POST ke action=daftar
if ($method === 'POST' && $action === 'daftar') {

    $input = json_decode(file_get_contents('php://input'), true);

    if ($input === null) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Format data (JSON) tidak valid!"]);
        exit();
    }

    $nis    = trim($input['nis'] ?? '');
    $nama   = trim($input['nama'] ?? '');
    $divisi = trim($input['divisi'] ?? '');
    $email  = trim($input['email'] ?? '');

    // Validasi field wajib
    if (empty($nis) || empty($nama) || empty($divisi) || empty($email)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Semua field formulir wajib diisi!"]);
        exit();
    }

    // Validasi format NIS (8 digit angka)
    if (!preg_match('/^[0-9]{8}$/', $nis)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Format NIS harus 8 digit angka!"]);
        exit();
    }

    // Validasi format email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Format email tidak valid!"]);
        exit();
    }

    // Validasi pilihan divisi (whitelist)
    $divisiValid = ["Web Development", "Mobile App", "Data Science & AI"];
    if (!in_array($divisi, $divisiValid, true)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Pilihan divisi tidak valid!"]);
        exit();
    }

    // Simpan ke database menggunakan Prepared Statement (aman dari SQL Injection)
    $stmt = $conn->prepare("INSERT INTO pendaftaran (nis, nama, divisi, email) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $nis, $nama, $divisi, $email);

    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode(["status" => "success", "message" => "Selamat! Data pendaftaran berhasil disimpan."]);
    } else {
        // Duplicate entry (NIS UNIQUE constraint)
        if ($conn->errno === 1062) {
            http_response_code(409);
            echo json_encode(["status" => "error", "message" => "Gagal menyimpan! NIS sudah terdaftar."]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Gagal menyimpan data ke database."]);
        }
    }

    $stmt->close();
    $conn->close();
    exit();
}

// Jika method/action tidak sesuai
http_response_code(404);
echo json_encode(["status" => "error", "message" => "Endpoint atau method tidak ditemukan."]);
$conn->close();