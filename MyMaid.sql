CREATE TABLE khach_hang (
    id_khach_hang INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ho_ten VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    mat_khau VARCHAR(255) NOT NULL,
    so_dien_thoai VARCHAR(15),
    ngay_sinh DATE,
    anh_ho_so_url TEXT,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dia_chi_da_luu (
    id_dia_chi INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_khach_hang INTEGER NOT NULL REFERENCES khach_hang(id_khach_hang) ON DELETE CASCADE,
    ten_goi_nho VARCHAR(100),
    dia_chi_day_du VARCHAR(255) NOT NULL
);

CREATE TABLE admin (
    id_admin INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ho_ten VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    mat_khau VARCHAR(255) NOT NULL,
    so_dien_thoai VARCHAR(15),
    ngay_sinh DATE,
    vai_tro VARCHAR(10) NOT NULL CHECK (vai_tro IN ('maid', 'admin')),
    trang_thai VARCHAR(20) DEFAULT 'active' CHECK (trang_thai IN ('active', 'inactive')),
    anh_ho_so_url TEXT,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE maid (
    id_maid INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ho_ten VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    mat_khau VARCHAR(255) NOT NULL,
    so_dien_thoai VARCHAR(15),
    ngay_sinh DATE,
    vai_tro VARCHAR(10) NOT NULL CHECK (vai_tro IN ('maid', 'admin')),
    trang_thai VARCHAR(20) DEFAULT 'active' CHECK (trang_thai IN ('active', 'inactive')),
    tieu_su TEXT,
    diem_danh_gia_tb NUMERIC(3,2) DEFAULT 5.00,
    anh_ho_so_url TEXT,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lich_lam_viec (
    id_lich_lam_viec INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_maid INTEGER NOT NULL REFERENCES maid(id_maid) ON DELETE CASCADE,
    ngay_lam DATE NOT NULL,
    gio_bat_dau TIME NOT NULL,
    gio_ket_thuc TIME NOT NULL,
    trang_thai VARCHAR(15) NOT NULL DEFAULT 'available'
        CHECK (trang_thai IN ('available', 'booked'))
);

CREATE TABLE khu_vuc (
    id_khu_vuc INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ten_khu_vuc VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE khu_vuc_hoat_dong (
    id_maid INTEGER NOT NULL REFERENCES maid(id_maid) ON DELETE CASCADE,
    id_khu_vuc INTEGER NOT NULL REFERENCES khu_vuc(id_khu_vuc) ON DELETE CASCADE,
    PRIMARY KEY (id_maid, id_khu_vuc)
);

CREATE TABLE danh_muc_dich_vu (
    id_danh_muc INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ten_danh_muc VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE dich_vu (
    id_dich_vu INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_danh_muc INTEGER NOT NULL REFERENCES danh_muc_dich_vu(id_danh_muc),
    ten_dich_vu VARCHAR(255) NOT NULL,
    mo_ta TEXT,
    gia_co_ban VARCHAR(100) NOT NULL
);

CREATE TABLE dich_vu_yeu_thich (
    id_khach_hang INTEGER NOT NULL REFERENCES khach_hang(id_khach_hang) ON DELETE CASCADE,
    id_dich_vu INTEGER NOT NULL REFERENCES dich_vu(id_dich_vu) ON DELETE CASCADE,
    PRIMARY KEY (id_khach_hang, id_dich_vu)
);

CREATE TABLE khuyen_mai (
    id_khuyen_mai INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ma_code VARCHAR(50) UNIQUE NOT NULL,
    mo_ta TEXT,
    so_luong INT,
    gia_tri_giam NUMERIC(10,2) NOT NULL,
    ngay_bat_dau TIMESTAMP,
    ngay_ket_thuc TIMESTAMP,
    trang_thai VARCHAR(10) DEFAULT 'active'
        CHECK (trang_thai IN ('active', 'inactive'))
);

CREATE TABLE thanh_toan (
    id_thanh_toan INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    phuong_thuc VARCHAR(50),
    so_tien NUMERIC(10,2) NOT NULL,
    ngay_thanh_toan TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    trang_thai VARCHAR(15)
        CHECK (trang_thai IN ('pending', 'successful', 'failed'))
);

CREATE TABLE lich_dat (
    id_lich_dat INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_khach_hang INTEGER NOT NULL REFERENCES khach_hang(id_khach_hang),
    id_dich_vu INTEGER NOT NULL REFERENCES dich_vu(id_dich_vu),
    id_maid INTEGER REFERENCES maid(id_maid),
    id_dia_chi INTEGER NOT NULL REFERENCES dia_chi_da_luu(id_dia_chi),
    id_thanh_toan INTEGER REFERENCES thanh_toan(id_thanh_toan),
    id_khuyen_mai INTEGER REFERENCES khuyen_mai(id_khuyen_mai),
    thoi_gian_dat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_lam_viec DATE NOT NULL,
    gio_lam_viec TIME NOT NULL,
    ghi_chu TEXT,
    tong_tien NUMERIC(10,2) NOT NULL,
    trang_thai VARCHAR(30) DEFAULT 'pending'
        CHECK (trang_thai IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled'))
);

CREATE TABLE danh_gia (
    id_danh_gia INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_lich_dat INTEGER UNIQUE NOT NULL REFERENCES lich_dat(id_lich_dat),
    id_khach_hang INTEGER NOT NULL REFERENCES khach_hang(id_khach_hang),
    id_maid INTEGER NOT NULL REFERENCES maid(id_maid),
    so_sao INTEGER CHECK (so_sao BETWEEN 1 AND 5),
    binh_luan TEXT,
    ngay_danh_gia TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng lưu maid yêu thích của khách hàng
CREATE TABLE maid_yeu_thich (
    id_khach_hang INTEGER NOT NULL REFERENCES khach_hang(id_khach_hang) ON DELETE CASCADE,
    id_maid INTEGER NOT NULL REFERENCES maid(id_maid) ON DELETE CASCADE,
    PRIMARY KEY (id_khach_hang, id_maid)
);




DROP TABLE IF EXISTS danh_gia;
DROP TABLE IF EXISTS lich_dat;
DROP TABLE IF EXISTS dich_vu_yeu_thich;
DROP TABLE IF EXISTS dia_chi_da_luu;
DROP TABLE IF EXISTS khach_hang;
DROP TABLE IF EXISTS thanh_toan;
DROP TABLE IF EXISTS khuyen_mai;
DROP TABLE IF EXISTS lich_lam_viec;
DROP TABLE IF EXISTS khu_vuc_hoat_dong;
DROP TABLE IF EXISTS khu_vuc;
DROP TABLE IF EXISTS maid;
DROP TABLE IF EXISTS admin;
DROP TABLE IF EXISTS dich_vu;
DROP TABLE IF EXISTS danh_muc_dich_vu;
DROP TABLE IF EXISTS maid_yeu_thich;






-- Insert data into khach_hang (customers)
INSERT INTO khach_hang (ho_ten, email, mat_khau, so_dien_thoai, ngay_sinh, anh_ho_so_url) VALUES
('Nguyễn Văn A', 'a.nguyen@example.com', '123456abcda', '0911111111', '1980-01-15', NULL),
('Trần Thị B', 'b.tran@example.com', '123456abcdb', '0922222222', '1985-05-20', NULL),
('Lê Văn C', 'c.le@example.com', '123456abcdc', '0933333333', '1990-08-10', NULL),
('Phạm Thị D', 'd.pham@example.com', '123456abcdd', '0944444444', '1992-03-25', NULL),
('Hoàng Văn E', 'e.hoang@example.com', '123456abcde', '0955555555', '1988-11-05', NULL),
('Vũ Thị F', 'f.vu@example.com', '123456abcdf', '0966666666', '1995-07-15', NULL),
('Đặng Văn G', 'g.dang@example.com', '123456abcdg', '0977777777', '1983-09-30', NULL),
('Bùi Thị H', 'h.bui@example.com', '123456abcdh', '0988888888', '1991-12-12', NULL),
('Lý Văn I', 'i.ly@example.com', '123456abcdi', '0999999999', '1987-04-18', NULL),
('Trương Thị K', 'k.truong@example.com', '123456abcdk', '0900000000', '1993-06-22', NULL),
('Ngô Văn L', 'l.ngo@example.com', '123456abcdl', '0912345678', '1989-10-08', NULL);



-- Insert data into dia_chi_da_luu (saved addresses)
INSERT INTO dia_chi_da_luu (id_khach_hang, ten_goi_nho, dia_chi_day_du) VALUES
(1, 'Nhà riêng', '123 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM'),
(1, 'Công ty', '456 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM'),
(2, 'Nhà chính', '789 Đường Hai Bà Trưng, Phường Đa Kao, Quận 1, TP.HCM'),
(3, 'Căn hộ', '101 Đường Lê Duẩn, Phường Bến Thành, Quận 1, TP.HCM'),
(4, 'Nhà bố mẹ', '202 Đường Pasteur, Phường 8, Quận 3, TP.HCM'),
(5, 'Biệt thự', '303 Đường Võ Văn Tần, Phường 6, Quận 3, TP.HCM'),
(6, 'Chung cư', '404 Đường Nguyễn Đình Chiểu, Phường 4, Quận 3, TP.HCM'),
(7, 'Nhà trọ', '505 Đường Cách Mạng Tháng 8, Phường 11, Quận 3, TP.HCM'),
(8, 'Nhà mới', '606 Đường Lý Chính Thắng, Phường 9, Quận 3, TP.HCM'),
(9, 'Văn phòng', '707 Đường Trần Hưng Đạo, Phường Cầu Ông Lãnh, Quận 1, TP.HCM'),
(10, 'Nhà bạn', '808 Đường Nguyễn Trãi, Phường Phạm Ngũ Lão, Quận 1, TP.HCM'),
(11, 'Nhà thuê', '909 Đường Bùi Viện, Phường Phạm Ngũ Lão, Quận 1, TP.HCM');


-- Insert admin



-- Insert data into maid (maids)
INSERT INTO maid (ho_ten, email, mat_khau, so_dien_thoai, ngay_sinh, vai_tro, trang_thai, tieu_su, diem_danh_gia_tb, anh_ho_so_url) VALUES
('Nguyễn Thị Hoa', 'hoa.nguyen@example.com', '123456abcdh', '0912345678', '1990-05-15', 'maid', 'active', '5 năm kinh nghiệm dọn dẹp nhà cửa', 4.8, NULL),
('Trần Văn Minh', 'minh.tran@example.com', '123456abcdm', '0923456789', '1985-08-20', 'maid', 'active', 'Chuyên nghiệp về giặt ủi và là quần áo', 4.9, NULL),
('Lê Thị Lan', 'lan.le@example.com', '123456abcdl', '0934567890', '1992-03-10', 'maid', 'active', 'Nấu ăn ngon, đa dạng món', 4.7, NULL),
('Phạm Văn Tuấn', 'tuan.pham@example.com', '123456abcdt', '0945678901', '1988-11-25', 'maid', 'active', 'Kinh nghiệm chăm sóc trẻ em 7 năm', 4.6, NULL),
('Hoàng Thị Mai', 'mai.hoang@example.com', '123456abcdm', '0956789012', '1993-07-05', 'maid', 'active', 'Chuyên chăm sóc người già và bệnh nhân', 4.5, NULL),
('Vũ Đức Anh', 'anh.vu@example.com', '123456abcda', '0967890123', '1987-09-12', 'maid', 'active', 'Yêu thú cưng, có thể chăm sóc mọi loại vật nuôi', 4.9, NULL),
('Đặng Thị Hương', 'huong.dang@example.com', '123456abcdh', '0978901234', '1991-12-30', 'maid', 'active', 'Chuyên tổng vệ sinh nhà cửa, văn phòng', 4.7, NULL),
('Ngô Văn Hùng', 'hung.ngo@example.com', '123456abcdh', '0989012345', '1986-06-18', 'maid', 'active', 'Thợ sửa chữa đồ gia dụng nhỏ', 4.4, NULL),
('Bùi Thị Ngọc', 'ngoc.bui@example.com', '123456abcdn', '0990123456', '1994-02-22', 'maid', 'active', 'Chuyên dọn dẹp sau tiệc, sự kiện', 4.8, NULL),
('Lý Văn Cường', 'cuong.ly@example.com', '123456abcdc', '0901234567', '1989-10-08', 'maid', 'active', 'Kinh nghiệm làm vườn, chăm sóc cây cảnh', 4.3, NULL),
('Trương Thị Thu', 'thu.truong@example.com', '123456abcdt', '0913456789', '1995-04-17', 'maid', 'active', 'Chuyên vệ sinh cửa kính cao tầng', 4.6, NULL);


-- Insert data into lich_lam_viec (maid work schedules)
INSERT INTO lich_lam_viec (id_maid, ngay_lam, gio_bat_dau, gio_ket_thuc, trang_thai) VALUES
-- Maid 1
(1, CURRENT_DATE + INTERVAL '1 day', '08:00:00', '12:00:00', 'available'),
(1, CURRENT_DATE + INTERVAL '1 day', '13:00:00', '17:00:00', 'available'),
(1, CURRENT_DATE + INTERVAL '2 days', '09:00:00', '13:00:00', 'available'),
-- Maid 2
(2, CURRENT_DATE + INTERVAL '1 day', '10:00:00', '14:00:00', 'available'),
(2, CURRENT_DATE + INTERVAL '2 days', '08:00:00', '12:00:00', 'available'),
(2, CURRENT_DATE + INTERVAL '3 days', '13:00:00', '17:00:00', 'available'),
-- Maid 3
(3, CURRENT_DATE + INTERVAL '2 days', '09:00:00', '13:00:00', 'available'),
(3, CURRENT_DATE + INTERVAL '3 days', '14:00:00', '18:00:00', 'available'),
(3, CURRENT_DATE + INTERVAL '4 days', '10:00:00', '14:00:00', 'available'),
-- Maid 4
(4, CURRENT_DATE + INTERVAL '3 days', '08:00:00', '12:00:00', 'available'),
(4, CURRENT_DATE + INTERVAL '4 days', '13:00:00', '17:00:00', 'available'),
(4, CURRENT_DATE + INTERVAL '5 days', '09:00:00', '13:00:00', 'available'),
-- Maid 5
(5, CURRENT_DATE + INTERVAL '4 days', '10:00:00', '14:00:00', 'available'),
(5, CURRENT_DATE + INTERVAL '5 days', '08:00:00', '12:00:00', 'available'),
(5, CURRENT_DATE + INTERVAL '6 days', '13:00:00', '17:00:00', 'available'),
-- Maid 6
(6, CURRENT_DATE + INTERVAL '5 days', '09:00:00', '13:00:00', 'available'),
(6, CURRENT_DATE + INTERVAL '6 days', '14:00:00', '18:00:00', 'available'),
(6, CURRENT_DATE + INTERVAL '7 days', '10:00:00', '14:00:00', 'available'),
-- Maid 7
(7, CURRENT_DATE + INTERVAL '6 days', '08:00:00', '12:00:00', 'available'),
(7, CURRENT_DATE + INTERVAL '7 days', '13:00:00', '17:00:00', 'available'),
(7, CURRENT_DATE + INTERVAL '8 days', '09:00:00', '13:00:00', 'available'),
-- Maid 8
(8, CURRENT_DATE + INTERVAL '7 days', '10:00:00', '14:00:00', 'available'),
(8, CURRENT_DATE + INTERVAL '8 days', '08:00:00', '12:00:00', 'available'),
(8, CURRENT_DATE + INTERVAL '9 days', '13:00:00', '17:00:00', 'available'),
-- Maid 9
(9, CURRENT_DATE + INTERVAL '8 days', '09:00:00', '13:00:00', 'available'),
(9, CURRENT_DATE + INTERVAL '9 days', '14:00:00', '18:00:00', 'available'),
(9, CURRENT_DATE + INTERVAL '10 days', '10:00:00', '14:00:00', 'available'),
-- Maid 10
(10, CURRENT_DATE + INTERVAL '9 days', '08:00:00', '12:00:00', 'available'),
(10, CURRENT_DATE + INTERVAL '10 days', '13:00:00', '17:00:00', 'available'),
(10, CURRENT_DATE + INTERVAL '11 days', '09:00:00', '13:00:00', 'available'),
-- Maid 11
(11, CURRENT_DATE + INTERVAL '10 days', '10:00:00', '14:00:00', 'available'),
(11, CURRENT_DATE + INTERVAL '11 days', '08:00:00', '12:00:00', 'available'),
(11, CURRENT_DATE + INTERVAL '12 days', '13:00:00', '17:00:00', 'available');


-- Insert data into khu_vuc (areas)
INSERT INTO khu_vuc (ten_khu_vuc) VALUES
('Quận 1'),
('Quận 2'),
('Quận 3'),
('Quận 4'),
('Quận 5'),
('Quận 6'),
('Quận 7'),
('Quận 8'),
('Quận 9'),
('Quận 10'),
('Quận 11'),
('Quận 12');


-- Insert data into khu_vuc_hoat_dong (maid working areas)
INSERT INTO khu_vuc_hoat_dong (id_maid, id_khu_vuc) VALUES
(1, 1), (1, 2), (1, 3),
(2, 2), (2, 4), (2, 6),
(3, 1), (3, 5), (3, 7),
(4, 3), (4, 8), (4, 10),
(5, 5), (5, 9), (5, 11),
(6, 2), (6, 7), (6, 12),
(7, 1), (7, 4), (7, 8),
(8, 3), (8, 6), (8, 9),
(9, 5), (9, 10), (9, 12),
(10, 2), (10, 7), (10, 11),
(11, 1), (11, 3), (11, 5);



-- Insert data into danh_muc_dich_vu (service categories)
INSERT INTO danh_muc_dich_vu (ten_danh_muc) VALUES
('Tổng vệ sinh'),
('Vệ sinh nhà cửa'),
('Giặt sofa'),
('Vệ sinh ghế văn phòng'),
('Giặt nệm'),
('Vệ sinh thảm '),
('Vệ sinh thiết bị'),
('Vệ sinh cửa kính'),
('Khử trùng'),
('Giúp việc nhà');



-- Insert data into dich_vu (services)
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('1', 'Tổng vệ sinh nhà ở, nhà sau thi công', 'm2', '15.000 – 20.000');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('1', 'Tổng vệ sinh căn hộ chung cư, văn phòng', 'm2', '18.000 – 30.000');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('1', 'Vệ sinh kho xưởng, bệnh viện, nhà hàng, khách sạn', 'm2', '8.000 – 25.000');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('1', 'Tổng vệ sinh công trình sau xây dựng, sửa chữa', 'm2', '14.000 – 26.000');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('1', 'Tổng vệ sinh công trình định kỳ', 'm2', '10.000 – 18.000');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('1', 'Đu dây lau kính mặt ngoài', 'm2', '12.000 – 25.000');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('1', 'Lau kính mặt trong', 'm2', '10.000 – 22.000');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('1', 'Dịch vụ chà sàn', 'm2', '6.000 – 14.000');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('1', 'Dịch vụ mài sàn bê tông', 'm2', '20.000 – 70.000');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('1', 'Dịch vụ đánh bóng sàn đá mài Terrazzo', 'm2', '50.000 – 120.000');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('1', 'Dịch vụ đánh bóng sàn đá Granite', 'm2', '170.000 – 300.000');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('1', 'Dịch vụ giặt thảm trải sàn, thảm văn phòng', 'm2', '6.000 – 25.000');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('1', 'Dịch vụ giặt thảm trang trí', 'Tấm', '250.000 – 350.000');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('1', 'Vệ sinh, giặt ghế sofa', 'Bộ', '300.000 – 500.000');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('1', 'Vệ sinh, giặt rèm cửa', 'Kg', '35.000 – 50.000');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('1', 'Vệ sinh, giặt ghế văn phòng', 'Cái', '15.000 – 35.000');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('2', 'Vệ sinh căn hộ có diện tích dưới 50m2', 'Trọn gói', '1.800.000đ');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('2', 'Vệ sinh chung cư có diện tích 51m2 – 70m2', 'Trọn gói', '2.100.000đ');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('2', 'Căn hộ, chung cư diện tích 71m2 – 100m2', 'Trọn gói', '2.600.000đ');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('2', 'Chung cư có diện tích 101m2 – 130m2', 'Trọn gói', '3.200.000đ');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('2', 'Căn hộ có diện tích 131m2 – 160m2', 'Trọn gói', '3.700.000đ');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('2', 'Căn hộ, chung cư diện tích 161m2 – 200m2', 'Trọn gói', '4.200.000đ');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('2', 'Căn hộ, chung cư diện tích lớn hơn 200m2', 'Trọn gói', 'Liên hệ');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('2', 'Giặt ghế sofa', 'Bộ', '300.000đ – 500.000đ');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('2', 'Giặt nệm', 'Tấm', '250.000đ – 350.000đ');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('2', 'Giặt rèm dưới 17kg', 'Trọn gói', '600.000đ');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('2', 'Giặt rèm trên 17kg', 'Kg', '35.000đ/kg');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('2', 'Vệ sinh máy lạnh treo tường', 'Cái', '200.000đ');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('2', 'Vệ sinh máy giặt cửa trên', 'Cái', '450.000đ');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('2', 'Vệ sinh máy giặt (hãng Panasonic)', 'Cái', '600.000đ');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('2', 'Vệ sinh máy giặt cửa ngang', 'Cái', '650.000đ');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('3', 'Giặt bộ ghế sofa 2 chỗ ngồi (1.0m -> 1.5m)', 'Bộ', '250,000');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('3', 'Giặt bộ ghế sofa 3 chỗ ngồi (1,6m ->2.0m)', 'Bộ', '300.000');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('3', 'Vệ sinh bộ sofa góc L (2.0m -> 4.0m)', 'Bộ', '350,000 – 500.000');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('3', 'Giặt ghế sofa bộ lớn tại nhà', 'Bộ', 'Liên hệ');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('3', 'Vệ sinh ghế sofa tại quán cafe, karaoke, nhà hàng, khách sạn,…', 'Chiếc, Bộ', 'Liên hệ');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('3', 'Vệ sinh sofa và thảm trang trí', 'Bộ, Tấm', 'Liên hệ');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('4', 'Vệ sinh ghế văn phòng, vải, nỉ lưới', '< 50 Cái', '35.000 -> 40.000');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('4', 'Vệ sinh ghế văn phòng, vải, nỉ lưới', '50 -> 100 Cái', '25.000 -> 35.000');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('4', 'Giặt và vệ sinh ghế văn phòng, vải, nỉ lưới', '≥ 100 Cái', '20.000 -> 25.000');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('5', 'Dịch vụ giặt nệm tại nhà (nệm nhỏ 1,0m – 1,2m)', 'Tấm', '250.000');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('5', 'Dịch vụ giặt nệm tại nhà (nệm trung 1,4m – 1,8m)', 'Tấm', '300.000');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('5', 'Vệ sinh nệm tại nhà (nệm lớn 2,0m – 2,4m)', 'Tấm', '350.000');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('6', 'Thảm văn phòng', 'Dưới 50m2', '600.000');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('6', 'Thảm trang trí', '', '100.000đ/m2');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('6', 'Thảm cầu thang', '', '45.000đ/m2');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('7', 'Vệ sinh máy lạnh treo tường', '1HP – 2.5 HP', '200.000');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('7', 'Vệ sinh máy lạnh tủ đứng', '3HP – 5HP', '500.000');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('7', 'Vệ sinh điều hòa âm trần', '3HP – 5HP', '600.000');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('7', 'Vệ sinh điều hòa giấu trần', '>8HP', '900.000');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('8', 'Dịch vụ vệ sinh kính tòa nhà cao tầng mặt ngoài', 'm2', '10.000 – 30.000');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('8', 'Dịch vụ lau kính tòa nhà cao tầng mặt trong', 'm2', '8.000 – 15.000');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('8', 'Vệ sinh kính tòa nhà cao tầng mặt ngoài (mới lắp đặt)', 'm2', '15.000 – 25.000');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('8', 'Lau kính tòa nhà cao tầng mặt trong (mới lắp đặt)', 'm2', '10.000 – 15.000');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('8', 'Xử lý các vết ố ở trên cao', 'm2', 'Khảo sát');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('8', 'Xử lý các vết ố ở tầm thấp', 'm2', 'Khảo sát');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('8', 'Bắn silicon cho kính', 'm2', 'Khảo sát');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('8', 'Vệ sinh Alu', 'm2', '20.000 – 300.000');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('8', 'Vệ sinh bảng hiệu', 'm2', '300.000 – 600.000');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('9', 'Phun khử trùng Cloramin B', '>50 m2', '400,000');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('10', 'Dọn dẹp nhà cửa, nấu ăn', 'Bao ăn 24 giờ', '7.000.000');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('10', 'Giúp việc nhà và phụ chăm sóc trẻ sơ sinh', 'Bao ăn 24 giờ', '8.000.000 – 10.000.000');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('10', 'Giúp việc nhà và phụ chăm sóc trẻ nhỏ', 'Bao ăn 24 giờ', '7.000.000 – 9.000.000');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('10', 'Giúp việc nhà và phụ nuôi đẻ', 'Bao ăn 24 giờ', '7.000.000 – 10.000.000');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('10', 'Giúp việc nhà và phụ chăm sóc người già', 'Bao ăn 24 giờ', '7.000.000 – 9.000.000');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('10', 'Giúp việc nhà và phụ nuôi người bệnh', 'Bao ăn 24 giờ', '8.000.000 – 10.000.000');
INSERT INTO dich_vu (id_danh_muc, ten_dich_vu, mo_ta, gia_co_ban) VALUES ('10', 'Giúp việc cho người nước ngoài (domestic help for foreigners)', 'Bao ăn (meals included) 24 giờ (24 hours)', 'Thỏa thuận (The deal)');




-- Insert data into dich_vu_yeu_thich (favorite services)
INSERT INTO dich_vu_yeu_thich (id_khach_hang, id_dich_vu) VALUES
(1, 1), (1, 3),
(2, 2), (2, 5),
(3, 4), (3, 6),
(4, 1), (4, 8),
(5, 3), (5, 7),
(6, 2), (6, 9),
(7, 5), (7, 10),
(8, 4), (8, 11),
(9, 6), (9, 1),
(10, 7), (10, 2),
(11, 8), (11, 3);



-- Insert data into khuyen_mai (promotions)
INSERT INTO khuyen_mai (ma_code, mo_ta, so_luong, gia_tri_giam, ngay_bat_dau, ngay_ket_thuc, trang_thai) VALUES
('SUMMER2023', 'Giảm giá mùa hè', 100, 100000.00, '2023-06-01 00:00:00', '2023-08-31 23:59:59', 'active'),
('WELCOME10', 'Giảm giá cho khách hàng mới', 50, 50000.00, '2023-01-01 00:00:00', '2023-12-31 23:59:59', 'active'),
('CLEAN20', 'Giảm giá dịch vụ dọn dẹp', 30, 200000.00, '2023-05-01 00:00:00', '2023-05-31 23:59:59', 'inactive'),
('MAIDLOVE', 'Giảm giá ngày 8/3', 20, 150000.00, '2023-03-08 00:00:00', '2023-03-08 23:59:59', 'inactive'),
('FREESHIP', 'Miễn phí vận chuyển', 100, 30000.00, '2023-04-01 00:00:00', '2023-04-30 23:59:59', 'inactive'),
('BIRTHDAY', 'Giảm giá sinh nhật', 10, 250000.00, '2023-01-01 00:00:00', '2023-12-31 23:59:59', 'active'),
('NEWYEAR', 'Giảm giá năm mới', 50, 100000.00, '2023-01-01 00:00:00', '2023-01-15 23:59:59', 'inactive'),
('VIPMEMBER', 'Giảm giá thành viên VIP', 15, 200000.00, '2023-01-01 00:00:00', '2023-12-31 23:59:59', 'active'),
('FIRSTTIME', 'Giảm giá lần đầu sử dụng', 40, 50000.00, '2023-03-01 00:00:00', '2023-05-31 23:59:59', 'inactive'),
('HAPPYDAY', 'Giảm giá ngày hạnh phúc', 25, 75000.00, '2023-07-20 00:00:00', '2023-07-20 23:59:59', 'inactive'),
('SAVETIME', 'Tiết kiệm thời gian', 30, 100000.00, '2023-08-01 00:00:00', '2023-08-31 23:59:59', 'active');

-- Insert data into thanh_toan (payments)
INSERT INTO thanh_toan (phuong_thuc, so_tien, ngay_thanh_toan, trang_thai) VALUES
('Credit Card', 200000.00, CURRENT_TIMESTAMP - INTERVAL '10 days', 'successful'),
('Bank Transfer', 300000.00, CURRENT_TIMESTAMP - INTERVAL '9 days', 'successful'),
('MoMo', 150000.00, CURRENT_TIMESTAMP - INTERVAL '8 days', 'successful'),
('ZaloPay', 350000.00, CURRENT_TIMESTAMP - INTERVAL '7 days', 'successful'),
('Credit Card', 200000.00, CURRENT_TIMESTAMP - INTERVAL '6 days', 'successful'),
('Bank Transfer', 250000.00, CURRENT_TIMESTAMP - INTERVAL '5 days', 'successful'),
('MoMo', 500000.00, CURRENT_TIMESTAMP - INTERVAL '4 days', 'successful'),
('ZaloPay', 100000.00, CURRENT_TIMESTAMP - INTERVAL '3 days', 'successful'),
('Credit Card', 300000.00, CURRENT_TIMESTAMP - INTERVAL '2 days', 'successful'),
('Bank Transfer', 400000.00, CURRENT_TIMESTAMP - INTERVAL '1 day', 'successful'),
('MoMo', 200000.00, CURRENT_TIMESTAMP, 'pending');




-- Insert data into lich_dat (bookings)
INSERT INTO lich_dat (id_khach_hang, id_dich_vu, id_maid, id_dia_chi, id_thanh_toan, id_khuyen_mai, thoi_gian_dat, ngay_lam_viec, gio_lam_viec, ghi_chu, tong_tien, trang_thai) VALUES
(1, 1, 1, 1, 1, 1, CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_DATE - INTERVAL '9 days', '09:00:00', 'Nhà có 1 chó nhỏ', 180000.00, 'completed'),
(2, 2, 2, 3, 2, NULL, CURRENT_TIMESTAMP - INTERVAL '9 days', CURRENT_DATE - INTERVAL '8 days', '10:00:00', 'Cần mang theo dụng cụ giặt ủi', 300000.00, 'completed'),
(3, 3, 3, 5, 3, 2, CURRENT_TIMESTAMP - INTERVAL '8 days', CURRENT_DATE - INTERVAL '7 days', '11:00:00', 'Không có ghi chú', 300000.00, 'completed'),
(4, 4, 4, 7, 4, NULL, CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_DATE - INTERVAL '6 days', '13:00:00', 'Trẻ 5 tuổi', 200000.00, 'completed'),
(5, 5, 5, 9, 5, 3, CURRENT_TIMESTAMP - INTERVAL '6 days', CURRENT_DATE - INTERVAL '5 days', '14:00:00', 'Người già 70 tuổi', 350000.00, 'completed'),
(6, 6, 6, 2, 6, NULL, CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_DATE - INTERVAL '4 days', '15:00:00', 'Chó Alaska to', 50000.00, 'completed'),
(7, 7, 7, 4, 7, 4, CURRENT_TIMESTAMP - INTERVAL '4 days', CURRENT_DATE - INTERVAL '3 days', '16:00:00', 'Cần sửa tủ lạnh', 100000.00, 'completed'),
(8, 8, 8, 6, 8, NULL, CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_DATE - INTERVAL '2 days', '09:00:00', 'Nhà 3 tầng', 500000.00, 'completed'),
(9, 9, 9, 8, 9, 5, CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_DATE - INTERVAL '1 day', '10:00:00', 'Tiệc 20 người', 300000.00, 'completed'),
(10, 10, 10, 10, 10, NULL, CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_DATE, '11:00:00', 'Cửa kính tầng 2', 200000.00, 'in_progress'),
(11, 11, 11, 12, 11, 6, CURRENT_TIMESTAMP, CURRENT_DATE + INTERVAL '1 day', '13:00:00', 'Vườn 50m2', 150000.00, 'confirmed');

-- Insert data into danh_gia (reviews)
INSERT INTO danh_gia (id_lich_dat, id_khach_hang, id_maid, so_sao, binh_luan, ngay_danh_gia) VALUES
(1, 1, 1, 5, 'Dịch vụ tuyệt vời, maid rất chuyên nghiệp', CURRENT_TIMESTAMP - INTERVAL '9 days'),
(2, 2, 2, 4, 'Maid giặt ủi rất sạch sẽ', CURRENT_TIMESTAMP - INTERVAL '8 days'),
(3, 3, 3, 5, 'Bữa ăn ngon, đúng khẩu vị', CURRENT_TIMESTAMP - INTERVAL '7 days'),
(4, 4, 4, 4, 'Trẻ rất thích maid, sẽ đặt lại', CURRENT_TIMESTAMP - INTERVAL '6 days'),
(5, 5, 5, 3, 'Chăm sóc tốt nhưng hơi trễ giờ', CURRENT_TIMESTAMP - INTERVAL '5 days'),
(6, 6, 6, 5, 'Chó tôi rất thích người này', CURRENT_TIMESTAMP - INTERVAL '4 days'),
(7, 7, 7, 4, 'Sửa chữa nhanh, giá cả hợp lý', CURRENT_TIMESTAMP - INTERVAL '3 days'),
(8, 8, 8, 5, 'Nhà sạch bong sau khi dọn', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(9, 9, 9, 4, 'Dọn dẹp sau tiệc rất kỹ', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(10, 10, 10, 3, 'Cửa kính sạch nhưng hơi lâu', CURRENT_TIMESTAMP);



-- Dữ liệu mẫu maid yêu thích
INSERT INTO maid_yeu_thich (id_khach_hang, id_maid) VALUES
(1, 2), -- Khách 1 thích Maid 2
(1, 3), -- Khách 1 thích Maid 3
(2, 1), -- Khách 2 thích Maid 1
(2, 4), -- Khách 2 thích Maid 4
(3, 5), -- Khách 3 thích Maid 5
(3, 2), -- Khách 3 thích Maid 2
(3, 6); -- Khách 3 thích Maid 6


-- Insert data into admin (administrators)
INSERT INTO admin (ho_ten, email, mat_khau, so_dien_thoai, ngay_sinh, vai_tro, trang_thai, anh_ho_so_url) VALUES
('Trần Quản Trị', 'admin1@example.com', '123456abcdt', '0911111111', '1985-01-15', 'admin', 'active', NULL),
('Nguyễn Quản Lý', 'admin2@example.com', '123456abcdl', '0922222222', '1990-05-20', 'admin', 'active', NULL),
('Lê Hệ Thống', 'admin3@example.com', '123456abcdt', '0933333333', '1988-08-10', 'admin', 'active', NULL),
('Phạm Điều Hành', 'admin4@example.com', '123456abcdh', '0944444444', '1992-03-25', 'admin', 'inactive', NULL),
('Hoàng Siêu Cấp', 'superadmin@example.com', '123456abcdc', '0955555555', '1980-11-05', 'admin', 'active', NULL);



SELECT * FROM khach_hang WHERE id_khach_hang = 1;







