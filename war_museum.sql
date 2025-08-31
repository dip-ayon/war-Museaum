-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 31, 2025 at 05:59 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `war_museum`
--

-- --------------------------------------------------------

--
-- Table structure for table `artifacts`
--

CREATE TABLE `artifacts` (
  `id` int(11) NOT NULL,
  `collection_no` varchar(255) NOT NULL,
  `accession_no` varchar(255) DEFAULT NULL,
  `collection_date` date DEFAULT NULL,
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
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `artifacts`
--

INSERT INTO `artifacts` (`id`, `collection_no`, `accession_no`, `collection_date`, `donor`, `object_type`, `object_head`, `description`, `measurement`, `gallery_no`, `found_place`, `experiment_formula`, `significance_comment`, `correction`, `created_at`) VALUES
(1, 'COL001', 'ACC001', '2025-08-01', 'Rashid Ahmed', 'Sculpture', 'Bust of a Bengali King', 'A bronze bust of a Bengali king from the Mughal era.', '30cm x 40cm', 'G01', 'Rajshahi, Bangladesh', 'None', 'A key representation of Bengali royal history.', 'None', '2025-08-30 19:08:23'),
(2, 'COL002', 'ACC002', '2025-08-05', 'Sultana Begum', 'Painting', 'Dhaka Landscape', 'A painting depicting the skyline of Dhaka city at sunset.', '60cm x 80cm', 'G02', 'Dhaka, Bangladesh', 'None', 'Important as a portrayal of modern Dhaka.', 'None', '2025-08-30 19:08:23'),
(3, 'COL003', 'ACC003', '2025-08-10', 'Tanvir Hossain', 'Artifact', 'Ancient Pottery', 'A piece of ancient pottery from the Bengal region.', '20cm x 15cm', 'G03', 'Chittagong, Bangladesh', 'None', 'A rare example of early Bangladeshi pottery.', 'None', '2025-08-30 19:08:23'),
(5, 'COL004', 'ACC004', '2025-08-20', 'John Doe', 'Sculpture', 'Statue of a Freedom Fighter', 'A marble statue representing a freedom fighter from the liberation war.', '50cm x 100cm', 'G04', 'Dhaka, Bangladesh', 'None', 'A symbol of courage and sacrifice.', 'None', '2025-08-30 19:08:23'),
(8, 'sfghfshrtyhdsrgfda', 'dfgsnbhtgrfbh', '2025-08-31', 'fgsbndxrgtfb', 'fgsxbdfgbhtds', 'fdgxgnbfsdnx', 'zfxdcv', 'sdffgbh', 'sfdgbhfrgxdrb', 'sdfbhh', 'fstdbhdrfhbg', 'azdsfgva', 'sdfbasbh', '2025-08-31 05:45:48');

-- --------------------------------------------------------

--
-- Table structure for table `artifact_images`
--

CREATE TABLE `artifact_images` (
  `id` int(11) NOT NULL,
  `artifact_id` int(11) NOT NULL,
  `image_path` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `artifact_images`
--

INSERT INTO `artifact_images` (`id`, `artifact_id`, `image_path`, `created_at`) VALUES
(1, 1, 'image1.jpg', '2025-08-30 19:08:23'),
(2, 1, 'image2.jpg', '2025-08-30 19:08:23'),
(3, 2, 'image3.jpg', '2025-08-30 19:08:23'),
(4, 3, 'image4.jpg', '2025-08-30 19:08:23'),
(5, 3, 'image5.jpg', '2025-08-30 19:08:23'),
(6, 5, 'img_12345.jpg', '2025-08-30 19:08:23');

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`id`, `title`, `date`, `description`, `created_at`) VALUES
(1, 'Special Exhibition on War Heroes', '2025-09-15', 'A special exhibition showcasing the stories of war heroes.', '2025-08-31 21:57:11'),
(2, 'Workshop on Artifact Preservation', '2025-10-05', 'A workshop on how to preserve historical artifacts.', '2025-08-31 21:57:11'),
(3, 'Seminar on the History of the Liberation War', '2025-11-20', 'A seminar discussing the detailed history of the Liberation War.', '2025-08-31 21:57:11');

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
(1, 1, 'Login', 'Rashid Ahmed logged in as admin.', '2025-08-31 09:00:00'),
(2, 2, 'Artifact Created', 'Sultana Begum added a new artifact: Dhaka Skyline Painting.', '2025-08-31 09:15:00'),
(3, 3, 'Artifact Updated', 'Tanvir Hossain updated the description for Ancient Pottery.', '2025-08-31 09:30:00'),
(4, 2, 'Image Uploaded', 'Sultana Begum uploaded image img_12345.jpg for Dhaka Skyline Painting.', '2025-08-31 09:45:00');

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
(1, 'Rashid Ahmed', 'rashid.ahmed@bangla.com', '$2y$10$Q/4gvkrACNwlHNn4KV7.T.G.3IPZjucOEUdOOi8KGdZSUZb.tRrP6', 'admin', '2025-08-30 19:08:22'),
(2, 'Sultana Begum', 'sultana.begum@bangla.com', '$2y$10$Q/4gvkrACNwlHNn4KV7.T.G.3IPZjucOEUdOOi8KGdZSUZb.tRrP6', 'user', '2025-08-30 19:08:22'),
(3, 'Tanvir Hossain', 'tanvir.hossain@bangla.com', '$2y$10$Q/4gvkrACNwlHNn4KV7.T.G.3IPZjucOEUdOOi8KGdZSUZb.tRrP6', 'user', '2025-08-30 19:08:22'),
(4, 'Dip', 'dip272k@gmail.com', '$2y$10$01bu6ghIBFBVy3SKtl3E0.yLXHKqLwuqXfsblYIETk3LCG9hpmQPC', 'user', '2025-08-31 05:48:08'),
(7, 'War', 'toknowdip@gmail.com', '$2y$10$0mVhFYExJNbXQGO0iV8qN.t//n3l5P9tZMPomB.NPLim6KRAq7Fyq', 'user', '2025-08-31 05:51:16'),
(9, 'rafsun', 'toknowdip@gmail.co', '$2y$10$aZWqmH.kvAFOI3uT0rPmKOJRG7KRrhvWwS2Ul.nSUfA25LZbQmSZa', 'user', '2025-08-31 15:00:09'),
(11, 'rafsun', 'sofiamalik823@gmail.com', '$2y$10$vAJuEH17ig.nZ6r9NVI07OEBCqbXtAcDNWioWkN0bES1XvaKdAlQe', 'user', '2025-08-31 18:27:50'),
(12, 'rafsun', 'admin@museum.com', '$2y$10$Q/4gvkrACNwlHNn4KV7.T.G.3IPZjucOEUdOOi8KGdZSUZb.tRrP6', 'user', '2025-08-31 18:42:15');

-- --------------------------------------------------------

--
-- Table structure for table `visitors`
--

CREATE TABLE `visitors` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `visit_date` date NOT NULL,
  `comments` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `visitors`
--

INSERT INTO `visitors` (`id`, `name`, `email`, `visit_date`, `comments`, `created_at`) VALUES
(1, 'Ahmed Khan', 'ahmed.khan@example.com', '2025-08-28', 'A very informative and moving experience.', '2025-08-31 21:57:11'),
(2, 'Fatima Chowdhury', 'fatima.chowdhury@example.com', '2025-08-29', 'The museum is well-maintained and the exhibits are excellent.', '2025-08-31 21:57:11'),
(3, 'John Doe', 'john.doe@example.com', '2025-08-30', 'I learned a lot about the history of the war.', '2025-08-31 21:57:11');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `artifacts`
--
ALTER TABLE `artifacts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `artifact_images`
--
ALTER TABLE `artifact_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `artifact_id` (`artifact_id`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
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
-- Indexes for table `visitors`
--
ALTER TABLE `visitors`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `artifacts`
--
ALTER TABLE `artifacts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `artifact_images`
--
ALTER TABLE `artifact_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `system_logs`
--
ALTER TABLE `system_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `visitors`
--
ALTER TABLE `visitors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `artifact_images`
--
ALTER TABLE `artifact_images`
  ADD CONSTRAINT `artifact_images_ibfk_1` FOREIGN KEY (`artifact_id`) REFERENCES `artifacts` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `system_logs`
--
ALTER TABLE `system_logs`
  ADD CONSTRAINT `system_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;