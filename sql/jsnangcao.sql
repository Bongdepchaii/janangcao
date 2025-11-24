-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th10 24, 2025 lúc 02:06 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `jsnangcao`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product`
--

CREATE TABLE `product` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` int(11) NOT NULL,
  `img` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `product`
--

INSERT INTO `product` (`id`, `name`, `quantity`, `price`, `img`) VALUES
(1, 'iphone', 12, 250000, 'https://cdn2.fptshop.com.vn/unsafe/828x0/filters:format(webp):quality(75)/2023_9_13_638302015766090455_1_iPhone_15_Lineup_Screen__WWEN.jpg'),
(2, 'Samsung', 150000, 20, 'https://tse1.mm.bing.net/th/id/OIP.TZCyCG-YaY0YoO8QnRMOegHaE8?rs=1&pid=ImgDetMain&o=7&rm=3'),
(3, 'iPhone 15 ', 42, 199, 'https://th.bing.com/th/id/OIP.bM9Q4VGpkwV0onHUODeI_gHaDq?w=346&h=172&c=7&r=0&o=7&cb=ucfimgc2&pid=1.7&rm=3'),
(4, 'iPhone16', 32, 299, 'https://th.bing.com/th/id/OIP.bM9Q4VGpkwV0onHUODeI_gHaDq?w=346&h=172&c=7&r=0&o=7&cb=ucfimgc2&pid=1.7&rm=3'),
(5, 'iPhone 15 ', 42, 199, 'https://th.bing.com/th/id/OIP.bM9Q4VGpkwV0onHUODeI_gHaDq?w=346&h=172&c=7&r=0&o=7&cb=ucfimgc2&pid=1.7&rm=3'),
(6, 'iPhone16', 32, 299, 'https://th.bing.com/th/id/OIP.bM9Q4VGpkwV0onHUODeI_gHaDq?w=346&h=172&c=7&r=0&o=7&cb=ucfimgc2&pid=1.7&rm=3'),
(7, 'iPhone 12 ', 22, 194, 'https://th.bing.com/th/id/OIP.bM9Q4VGpkwV0onHUODeI_gHaDq?w=346&h=172&c=7&r=0&o=7&cb=ucfimgc2&pid=1.7&rm=3'),
(8, 'iPhone16', 12, 149, 'https://th.bing.com/th/id/OIP.bM9Q4VGpkwV0onHUODeI_gHaDq?w=346&h=172&c=7&r=0&o=7&cb=ucfimgc2&pid=1.7&rm=3'),
(9, 'iPhone 12 pro ', 52, 194, 'https://th.bing.com/th/id/OIP.bM9Q4VGpkwV0onHUODeI_gHaDq?w=346&h=172&c=7&r=0&o=7&cb=ucfimgc2&pid=1.7&rm=3'),
(10, 'iPhone 16 Pro Max', 94, 699, 'https://th.bing.com/th/id/OIP.bM9Q4VGpkwV0onHUODeI_gHaDq?w=346&h=172&c=7&r=0&o=7&cb=ucfimgc2&pid=1.7&rm=3'),
(11, 'Samsung S20 ', 11, 899, 'https://th.bing.com/th/id/OIP.bM9Q4VGpkwV0onHUODeI_gHaDq?w=346&h=172&c=7&r=0&o=7&cb=ucfimgc2&pid=1.7&rm=3'),
(12, 'Samsung S20 Ultra', 42, 589, 'https://th.bing.com/th/id/OIP.bM9Q4VGpkwV0onHUODeI_gHaDq?w=346&h=172&c=7&r=0&o=7&cb=ucfimgc2&pid=1.7&rm=3');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `product`
--
ALTER TABLE `product`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `product`
--
ALTER TABLE `product`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
