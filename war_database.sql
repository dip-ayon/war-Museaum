-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 30, 2025 at 03:09 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `war_database`
--

-- --------------------------------------------------------

--
-- Table structure for table `artifacts`
--

CREATE TABLE `artifacts` (
  `id` int(11) NOT NULL,
  `collection_no` varchar(255) NOT NULL,
  `accession_no` varchar(255) DEFAULT NULL,
  `collection_date` varchar(255) DEFAULT NULL,
  `donor` varchar(255) DEFAULT NULL,
  `object_type` varchar(255) DEFAULT NULL,
  `object_head` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `measurement` varchar(255) DEFAULT NULL,
  `gallery_no` varchar(255) DEFAULT NULL,
  `found_place` varchar(255) DEFAULT NULL,
  `experiment_formula` text DEFAULT NULL,
  `significance_comment` text DEFAULT NULL,
  `correction` text DEFAULT NULL,
  `images` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `artifacts`
--

INSERT INTO `artifacts` (`id`, `collection_no`, `accession_no`, `collection_date`, `donor`, `object_type`, `object_head`, `description`, `measurement`, `gallery_no`, `found_place`, `experiment_formula`, `significance_comment`, `correction`, `images`, `created_at`) VALUES
(1, 'COL001', 'ACC001', '2025-08-01', 'Rashid Ahmed', 'Sculpture', 'Bust of a Bengali King', 'A bronze bust of a Bengali king from the Mughal era.', '30cm x 40cm', 'G01', 'Rajshahi, Bangladesh', 'None', 'A key representation of Bengali royal history.', 'None', 'image1.jpg', '2025-08-30 19:08:23'),
(2, 'COL002', 'ACC002', '2025-08-05', 'Sultana Begum', 'Painting', 'Dhaka Landscape', 'A painting depicting the skyline of Dhaka city at sunset.', '60cm x 80cm', 'G02', 'Dhaka, Bangladesh', 'None', 'Important as a portrayal of modern Dhaka.', 'None', 'image2.jpg', '2025-08-30 19:08:23'),
(3, 'COL003', 'ACC003', '2025-08-10', 'Tanvir Hossain', 'Artifact', 'Ancient Pottery', 'A piece of ancient pottery from the Bengal region.', '20cm x 15cm', 'G03', 'Chittagong, Bangladesh', 'None', 'A rare example of early Bangladeshi pottery.', 'None', 'image3.jpg', '2025-08-30 19:08:23');

-- --------------------------------------------------------

--
-- Table structure for table `system_logs`
--

CREATE TABLE `system_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` text DEFAULT NULL,
  `details` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `system_logs`
--

INSERT INTO `system_logs` (`id`, `user_id`, `action`, `details`, `created_at`) VALUES
(1, 1, 'Login', 'Rashid Ahmed logged in as admin.', '2025-08-30 19:08:23'),
(2, 2, 'Artifact Created', 'Sultana Begum created an artifact entry for Dhaka Landscape.', '2025-08-30 19:08:23'),
(3, 3, 'Artifact Created', 'Tanvir Hossain created an artifact entry for Ancient Pottery.', '2025-08-30 19:08:23');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'user',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`) VALUES
(1, 'Rashid Ahmed', 'rashid.ahmed@bangla.com', 'password123', 'admin', '2025-08-30 19:08:22'),
(2, 'Sultana Begum', 'sultana.begum@bangla.com', 'password456', 'user', '2025-08-30 19:08:22'),
(3, 'Tanvir Hossain', 'tanvir.hossain@bangla.com', 'password789', 'user', '2025-08-30 19:08:22');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `artifacts`
--
ALTER TABLE `artifacts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `system_logs`
--
ALTER TABLE `system_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `artifacts`
--
ALTER TABLE `artifacts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `system_logs`
--
ALTER TABLE `system_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `system_logs`
--
ALTER TABLE `system_logs`
  ADD CONSTRAINT `system_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
