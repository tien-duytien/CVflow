-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th4 13, 2026 lúc 08:49 AM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `cv_management`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `certificates`
--

CREATE TABLE `certificates` (
  `certificate_id` int(11) NOT NULL,
  `certificate_name` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `certificates`
--

INSERT INTO `certificates` (`certificate_id`, `certificate_name`) VALUES
(1, 'AWS Certified Developer'),
(2, 'Project Management Professional (PMP)'),
(3, 'IELTS'),
(4, 'TOEIC'),
(5, 'Google Data Analytics Professional Certificate'),
(6, 'Microsoft Certified: Azure Fundamentals'),
(7, 'Cisco Certified Network Associate (CCNA)');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cities`
--

CREATE TABLE `cities` (
  `city_id` int(11) NOT NULL,
  `city_name` varchar(100) NOT NULL,
  `country_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `cities`
--

INSERT INTO `cities` (`city_id`, `city_name`, `country_id`) VALUES
(1, 'Ho Chi Minh City', 1),
(2, 'Hanoi', 1),
(3, 'New York', 2),
(4, 'Los Angeles', 2),
(5, 'Tokyo', 3),
(6, 'Osaka', 3),
(7, 'Seoul', 4),
(8, 'Berlin', 5),
(9, 'Paris', 6),
(10, 'Toronto', 8);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `countries`
--

CREATE TABLE `countries` (
  `country_id` int(11) NOT NULL,
  `country_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `countries`
--

INSERT INTO `countries` (`country_id`, `country_name`) VALUES
(1, 'Vietnam'),
(2, 'United States'),
(3, 'Japan'),
(4, 'South Korea'),
(5, 'Germany'),
(6, 'France'),
(7, 'United Kingdom'),
(8, 'Canada'),
(9, 'Australia'),
(10, 'Singapore');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cvs`
--

CREATE TABLE `cvs` (
  `cv_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `summary` text DEFAULT NULL,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `gender` enum('Male','Female') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `cvs`
--

INSERT INTO `cvs` (`cv_id`, `user_id`, `category_id`, `full_name`, `date_of_birth`, `email`, `phone`, `summary`, `updated_at`, `gender`) VALUES
(2, 3, 1, 'Đặng Duy Tiến', '2004-03-18', 'tien.dangduytien@hcmut.edu.vn', '0349993774', 'Introvert', '2026-03-18 09:47:24', 'Male'),
(6, 7, 1, 'Đặng Duy Tiến', '2004-03-28', 'dangduytien22@gmail.com', '0349993774', '', '2026-03-18 10:08:50', 'Male');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cv_addresses`
--

CREATE TABLE `cv_addresses` (
  `address_id` int(11) NOT NULL,
  `cv_id` int(11) NOT NULL,
  `country_id` int(11) NOT NULL,
  `city_id` int(11) NOT NULL,
  `district_id` int(11) NOT NULL,
  `street_address` varchar(255) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `cv_addresses`
--

INSERT INTO `cv_addresses` (`address_id`, `cv_id`, `country_id`, `city_id`, `district_id`, `street_address`, `postal_code`) VALUES
(1, 2, 1, 1, 35, '', ''),
(2, 6, 1, 1, 1, '', '');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cv_categories`
--

CREATE TABLE `cv_categories` (
  `category_id` int(11) NOT NULL,
  `category_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `cv_categories`
--

INSERT INTO `cv_categories` (`category_id`, `category_name`) VALUES
(1, 'Software Development'),
(2, 'Data Science'),
(3, 'Finance'),
(4, 'Marketing'),
(5, 'Education'),
(6, 'Design');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cv_certificates`
--

CREATE TABLE `cv_certificates` (
  `cv_certificate_id` int(11) NOT NULL,
  `cv_id` int(11) NOT NULL,
  `certificate_id` int(11) NOT NULL,
  `issuing_org_id` int(11) NOT NULL,
  `issued_year` year(4) DEFAULT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `cv_certificates`
--

INSERT INTO `cv_certificates` (`cv_certificate_id`, `cv_id`, `certificate_id`, `issuing_org_id`, `issued_year`, `description`) VALUES
(11, 6, 1, 1, '2022', ''),
(12, 2, 3, 3, '2022', 'IELTS 6.0');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cv_education`
--

CREATE TABLE `cv_education` (
  `education_id` int(11) NOT NULL,
  `cv_id` int(11) NOT NULL,
  `institution_id` int(11) NOT NULL,
  `degree_level_id` int(11) NOT NULL,
  `major_id` int(11) NOT NULL,
  `start_year` year(4) DEFAULT NULL,
  `end_year` year(4) DEFAULT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `cv_education`
--

INSERT INTO `cv_education` (`education_id`, `cv_id`, `institution_id`, `degree_level_id`, `major_id`, `start_year`, `end_year`, `description`) VALUES
(19, 6, 1, 2, 1, '2022', '2026', ''),
(20, 2, 1, 2, 1, '2022', '2026', '');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cv_skills`
--

CREATE TABLE `cv_skills` (
  `cv_skill_id` int(11) NOT NULL,
  `cv_id` int(11) NOT NULL,
  `skill_id` int(11) NOT NULL,
  `proficiency_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `cv_skills`
--

INSERT INTO `cv_skills` (`cv_skill_id`, `cv_id`, `skill_id`, `proficiency_id`) VALUES
(35, 6, 9, 1),
(36, 6, 4, 3),
(37, 2, 6, 1),
(38, 2, 2, 1),
(39, 2, 3, 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cv_work_history`
--

CREATE TABLE `cv_work_history` (
  `work_id` int(11) NOT NULL,
  `cv_id` int(11) NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `job_title_id` int(11) NOT NULL,
  `employment_type_id` int(11) NOT NULL,
  `industry_id` int(11) NOT NULL,
  `start_year` year(4) DEFAULT NULL,
  `end_year` year(4) DEFAULT NULL,
  `is_present` tinyint(1) DEFAULT 0,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `cv_work_history`
--

INSERT INTO `cv_work_history` (`work_id`, `cv_id`, `company_name`, `job_title_id`, `employment_type_id`, `industry_id`, `start_year`, `end_year`, `is_present`, `description`) VALUES
(15, 6, 'Microsoft ', 3, 1, 1, '2022', '2024', 1, ''),
(16, 2, 'FPT', 4, 5, 1, '2022', '2026', 0, '');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `degree_levels`
--

CREATE TABLE `degree_levels` (
  `degree_level_id` int(11) NOT NULL,
  `degree_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `degree_levels`
--

INSERT INTO `degree_levels` (`degree_level_id`, `degree_name`) VALUES
(1, 'Associate'),
(2, 'Bachelor'),
(3, 'Master'),
(4, 'PhD');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `districts`
--

CREATE TABLE `districts` (
  `district_id` int(11) NOT NULL,
  `district_name` varchar(100) NOT NULL,
  `city_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `districts`
--

INSERT INTO `districts` (`district_id`, `district_name`, `city_id`) VALUES
(1, 'District 1', 1),
(2, 'District 3', 1),
(3, 'Binh Thanh', 1),
(4, 'Ba Dinh', 2),
(5, 'Hoan Kiem', 2),
(6, 'Dong Da', 2),
(7, 'Manhattan', 3),
(8, 'Brooklyn', 3),
(9, 'Hollywood', 4),
(10, 'Downtown LA', 4),
(11, 'Shinjuku', 5),
(12, 'Shibuya', 5),
(35, 'Tan Phu', 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `employment_types`
--

CREATE TABLE `employment_types` (
  `employment_type_id` int(11) NOT NULL,
  `employment_type` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `employment_types`
--

INSERT INTO `employment_types` (`employment_type_id`, `employment_type`) VALUES
(1, 'Full-time'),
(2, 'Part-time'),
(3, 'Internship'),
(4, 'Contract'),
(5, 'Freelance'),
(6, 'Temporary');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `industries`
--

CREATE TABLE `industries` (
  `industry_id` int(11) NOT NULL,
  `industry_name` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `industries`
--

INSERT INTO `industries` (`industry_id`, `industry_name`) VALUES
(1, 'Information Technology'),
(2, 'Finance'),
(3, 'Education'),
(4, 'Healthcare'),
(5, 'E-commerce'),
(6, 'Telecommunications'),
(7, 'Manufacturing'),
(8, 'Marketing & Advertising');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `institutions`
--

CREATE TABLE `institutions` (
  `institution_id` int(11) NOT NULL,
  `institution_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `institutions`
--

INSERT INTO `institutions` (`institution_id`, `institution_name`) VALUES
(1, 'Ho Chi Minh City University of Technology'),
(2, 'Vietnam National University'),
(3, 'Hanoi University of Science and Technology'),
(4, 'FPT University'),
(5, 'RMIT University Vietnam');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `issuing_organizations`
--

CREATE TABLE `issuing_organizations` (
  `issuing_org_id` int(11) NOT NULL,
  `organization_name` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `issuing_organizations`
--

INSERT INTO `issuing_organizations` (`issuing_org_id`, `organization_name`) VALUES
(1, 'Amazon'),
(2, 'Project Management Institute (PMI)'),
(3, 'British Council'),
(4, 'IDP Education'),
(5, 'Google'),
(6, 'Microsoft'),
(7, 'Cisco');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `job_titles`
--

CREATE TABLE `job_titles` (
  `job_title_id` int(11) NOT NULL,
  `job_title` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `job_titles`
--

INSERT INTO `job_titles` (`job_title_id`, `job_title`) VALUES
(1, 'Software Engineer'),
(2, 'Frontend Developer'),
(3, 'Backend Developer'),
(4, 'Full Stack Developer'),
(5, 'Data Analyst'),
(6, 'Project Manager'),
(7, 'UI/UX Designer'),
(8, 'DevOps Engineer');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `majors`
--

CREATE TABLE `majors` (
  `major_id` int(11) NOT NULL,
  `major_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `majors`
--

INSERT INTO `majors` (`major_id`, `major_name`) VALUES
(1, 'Computer Science'),
(2, 'Information Technology'),
(3, 'Software Engineering'),
(4, 'Business Administration'),
(5, 'Electrical Engineering'),
(6, 'Mechanical Engineering'),
(7, 'Data Science'),
(8, 'Artificial Intelligence');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `proficiency_levels`
--

CREATE TABLE `proficiency_levels` (
  `proficiency_id` int(11) NOT NULL,
  `level_name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `proficiency_levels`
--

INSERT INTO `proficiency_levels` (`proficiency_id`, `level_name`) VALUES
(1, 'Beginner'),
(2, 'Intermediate'),
(3, 'Advanced'),
(4, 'Expert');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `roles`
--

CREATE TABLE `roles` (
  `role_id` int(11) NOT NULL,
  `role_name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `roles`
--

INSERT INTO `roles` (`role_id`, `role_name`) VALUES
(1, 'seeker'),
(2, 'employer'),
(3, 'admin');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `skills`
--

CREATE TABLE `skills` (
  `skill_id` int(11) NOT NULL,
  `skill_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `skills`
--

INSERT INTO `skills` (`skill_id`, `skill_name`) VALUES
(1, 'Java'),
(2, 'Python'),
(3, 'SQL'),
(4, 'JavaScript'),
(5, 'HTML'),
(6, 'CSS'),
(7, 'Communication'),
(8, 'Problem Solving'),
(9, 'Teamwork'),
(10, 'Git');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role_id` int(11) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`user_id`, `email`, `password_hash`, `role_id`, `created_at`) VALUES
(3, 'tien.dangduytien@hcmut.edu.vn', '$2y$10$KQzs1j8z6lkd.fe1qBqtbONY2cEKbm.zb75t5EuIRibLH36PujT6O', 1, '2026-03-17 10:54:55'),
(5, 'dangduytien20@gmail.com', '$2y$10$PaSlm4qUWcmIyagJfu/ahOkVGzYz3HiLk.o4S6JDanAKJXjo3LBOq', 2, '2026-03-17 12:22:03'),
(6, 'dangduytien21@gmail.com', '$2y$10$mWN.xnuuI34kVnG5h8Jju.DvBOgSDhpRt3c8Ilp3g5J2Wr4.U/PCG', 3, '2026-03-17 23:49:53'),
(7, 'dangduytien22@gmail.com', '$2y$10$qD8/J0iUNHps1L.UEEllc.jB9JpQMLe5e/IxRC41GKlgTcvk9C35a', 1, '2026-03-18 10:07:43'),
(8, 'dangduytien23@gmail.com', '$2y$10$L9Zv4hNFQN81s5RjvgUH8OS//4GKjnfd6.Y5OCq1HvR//6uQkrikO', 2, '2026-03-18 16:30:25');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `certificates`
--
ALTER TABLE `certificates`
  ADD PRIMARY KEY (`certificate_id`);

--
-- Chỉ mục cho bảng `cities`
--
ALTER TABLE `cities`
  ADD PRIMARY KEY (`city_id`),
  ADD KEY `fk_cities_country` (`country_id`);

--
-- Chỉ mục cho bảng `countries`
--
ALTER TABLE `countries`
  ADD PRIMARY KEY (`country_id`);

--
-- Chỉ mục cho bảng `cvs`
--
ALTER TABLE `cvs`
  ADD PRIMARY KEY (`cv_id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Chỉ mục cho bảng `cv_addresses`
--
ALTER TABLE `cv_addresses`
  ADD PRIMARY KEY (`address_id`),
  ADD KEY `cv_id` (`cv_id`),
  ADD KEY `country_id` (`country_id`),
  ADD KEY `city_id` (`city_id`),
  ADD KEY `district_id` (`district_id`);

--
-- Chỉ mục cho bảng `cv_categories`
--
ALTER TABLE `cv_categories`
  ADD PRIMARY KEY (`category_id`);

--
-- Chỉ mục cho bảng `cv_certificates`
--
ALTER TABLE `cv_certificates`
  ADD PRIMARY KEY (`cv_certificate_id`),
  ADD KEY `cv_id` (`cv_id`),
  ADD KEY `certificate_id` (`certificate_id`),
  ADD KEY `issuing_org_id` (`issuing_org_id`);

--
-- Chỉ mục cho bảng `cv_education`
--
ALTER TABLE `cv_education`
  ADD PRIMARY KEY (`education_id`),
  ADD KEY `cv_id` (`cv_id`),
  ADD KEY `institution_id` (`institution_id`),
  ADD KEY `degree_level_id` (`degree_level_id`),
  ADD KEY `major_id` (`major_id`);

--
-- Chỉ mục cho bảng `cv_skills`
--
ALTER TABLE `cv_skills`
  ADD PRIMARY KEY (`cv_skill_id`),
  ADD UNIQUE KEY `cv_id` (`cv_id`,`skill_id`),
  ADD KEY `skill_id` (`skill_id`),
  ADD KEY `proficiency_id` (`proficiency_id`);

--
-- Chỉ mục cho bảng `cv_work_history`
--
ALTER TABLE `cv_work_history`
  ADD PRIMARY KEY (`work_id`),
  ADD KEY `cv_id` (`cv_id`),
  ADD KEY `job_title_id` (`job_title_id`),
  ADD KEY `employment_type_id` (`employment_type_id`),
  ADD KEY `industry_id` (`industry_id`);

--
-- Chỉ mục cho bảng `degree_levels`
--
ALTER TABLE `degree_levels`
  ADD PRIMARY KEY (`degree_level_id`);

--
-- Chỉ mục cho bảng `districts`
--
ALTER TABLE `districts`
  ADD PRIMARY KEY (`district_id`),
  ADD KEY `fk_districts_city` (`city_id`);

--
-- Chỉ mục cho bảng `employment_types`
--
ALTER TABLE `employment_types`
  ADD PRIMARY KEY (`employment_type_id`);

--
-- Chỉ mục cho bảng `industries`
--
ALTER TABLE `industries`
  ADD PRIMARY KEY (`industry_id`);

--
-- Chỉ mục cho bảng `institutions`
--
ALTER TABLE `institutions`
  ADD PRIMARY KEY (`institution_id`);

--
-- Chỉ mục cho bảng `issuing_organizations`
--
ALTER TABLE `issuing_organizations`
  ADD PRIMARY KEY (`issuing_org_id`);

--
-- Chỉ mục cho bảng `job_titles`
--
ALTER TABLE `job_titles`
  ADD PRIMARY KEY (`job_title_id`);

--
-- Chỉ mục cho bảng `majors`
--
ALTER TABLE `majors`
  ADD PRIMARY KEY (`major_id`);

--
-- Chỉ mục cho bảng `proficiency_levels`
--
ALTER TABLE `proficiency_levels`
  ADD PRIMARY KEY (`proficiency_id`);

--
-- Chỉ mục cho bảng `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`role_id`);

--
-- Chỉ mục cho bảng `skills`
--
ALTER TABLE `skills`
  ADD PRIMARY KEY (`skill_id`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `role_id` (`role_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `certificates`
--
ALTER TABLE `certificates`
  MODIFY `certificate_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `cities`
--
ALTER TABLE `cities`
  MODIFY `city_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT cho bảng `countries`
--
ALTER TABLE `countries`
  MODIFY `country_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT cho bảng `cvs`
--
ALTER TABLE `cvs`
  MODIFY `cv_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `cv_addresses`
--
ALTER TABLE `cv_addresses`
  MODIFY `address_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `cv_categories`
--
ALTER TABLE `cv_categories`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `cv_certificates`
--
ALTER TABLE `cv_certificates`
  MODIFY `cv_certificate_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT cho bảng `cv_education`
--
ALTER TABLE `cv_education`
  MODIFY `education_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT cho bảng `cv_skills`
--
ALTER TABLE `cv_skills`
  MODIFY `cv_skill_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT cho bảng `cv_work_history`
--
ALTER TABLE `cv_work_history`
  MODIFY `work_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT cho bảng `degree_levels`
--
ALTER TABLE `degree_levels`
  MODIFY `degree_level_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `districts`
--
ALTER TABLE `districts`
  MODIFY `district_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT cho bảng `employment_types`
--
ALTER TABLE `employment_types`
  MODIFY `employment_type_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `industries`
--
ALTER TABLE `industries`
  MODIFY `industry_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `institutions`
--
ALTER TABLE `institutions`
  MODIFY `institution_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `issuing_organizations`
--
ALTER TABLE `issuing_organizations`
  MODIFY `issuing_org_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `job_titles`
--
ALTER TABLE `job_titles`
  MODIFY `job_title_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `majors`
--
ALTER TABLE `majors`
  MODIFY `major_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT cho bảng `proficiency_levels`
--
ALTER TABLE `proficiency_levels`
  MODIFY `proficiency_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `roles`
--
ALTER TABLE `roles`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT cho bảng `skills`
--
ALTER TABLE `skills`
  MODIFY `skill_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `cities`
--
ALTER TABLE `cities`
  ADD CONSTRAINT `fk_cities_country` FOREIGN KEY (`country_id`) REFERENCES `countries` (`country_id`);

--
-- Các ràng buộc cho bảng `cvs`
--
ALTER TABLE `cvs`
  ADD CONSTRAINT `cvs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `cvs_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `cv_categories` (`category_id`);

--
-- Các ràng buộc cho bảng `cv_addresses`
--
ALTER TABLE `cv_addresses`
  ADD CONSTRAINT `cv_addresses_ibfk_1` FOREIGN KEY (`cv_id`) REFERENCES `cvs` (`cv_id`),
  ADD CONSTRAINT `cv_addresses_ibfk_2` FOREIGN KEY (`country_id`) REFERENCES `countries` (`country_id`),
  ADD CONSTRAINT `cv_addresses_ibfk_3` FOREIGN KEY (`city_id`) REFERENCES `cities` (`city_id`),
  ADD CONSTRAINT `cv_addresses_ibfk_4` FOREIGN KEY (`district_id`) REFERENCES `districts` (`district_id`);

--
-- Các ràng buộc cho bảng `cv_certificates`
--
ALTER TABLE `cv_certificates`
  ADD CONSTRAINT `cv_certificates_ibfk_1` FOREIGN KEY (`cv_id`) REFERENCES `cvs` (`cv_id`),
  ADD CONSTRAINT `cv_certificates_ibfk_2` FOREIGN KEY (`certificate_id`) REFERENCES `certificates` (`certificate_id`),
  ADD CONSTRAINT `cv_certificates_ibfk_3` FOREIGN KEY (`issuing_org_id`) REFERENCES `issuing_organizations` (`issuing_org_id`);

--
-- Các ràng buộc cho bảng `cv_education`
--
ALTER TABLE `cv_education`
  ADD CONSTRAINT `cv_education_ibfk_1` FOREIGN KEY (`cv_id`) REFERENCES `cvs` (`cv_id`),
  ADD CONSTRAINT `cv_education_ibfk_2` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`institution_id`),
  ADD CONSTRAINT `cv_education_ibfk_3` FOREIGN KEY (`degree_level_id`) REFERENCES `degree_levels` (`degree_level_id`),
  ADD CONSTRAINT `cv_education_ibfk_4` FOREIGN KEY (`major_id`) REFERENCES `majors` (`major_id`);

--
-- Các ràng buộc cho bảng `cv_skills`
--
ALTER TABLE `cv_skills`
  ADD CONSTRAINT `cv_skills_ibfk_1` FOREIGN KEY (`cv_id`) REFERENCES `cvs` (`cv_id`),
  ADD CONSTRAINT `cv_skills_ibfk_2` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`skill_id`),
  ADD CONSTRAINT `cv_skills_ibfk_3` FOREIGN KEY (`proficiency_id`) REFERENCES `proficiency_levels` (`proficiency_id`);

--
-- Các ràng buộc cho bảng `cv_work_history`
--
ALTER TABLE `cv_work_history`
  ADD CONSTRAINT `cv_work_history_ibfk_1` FOREIGN KEY (`cv_id`) REFERENCES `cvs` (`cv_id`),
  ADD CONSTRAINT `cv_work_history_ibfk_2` FOREIGN KEY (`job_title_id`) REFERENCES `job_titles` (`job_title_id`),
  ADD CONSTRAINT `cv_work_history_ibfk_3` FOREIGN KEY (`employment_type_id`) REFERENCES `employment_types` (`employment_type_id`),
  ADD CONSTRAINT `cv_work_history_ibfk_4` FOREIGN KEY (`industry_id`) REFERENCES `industries` (`industry_id`);

--
-- Các ràng buộc cho bảng `districts`
--
ALTER TABLE `districts`
  ADD CONSTRAINT `fk_districts_city` FOREIGN KEY (`city_id`) REFERENCES `cities` (`city_id`);

--
-- Các ràng buộc cho bảng `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
