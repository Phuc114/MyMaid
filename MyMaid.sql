CREATE TABLE khach_hang (
    id_khach_hang INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ho_ten VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    mat_khau VARCHAR(255) NOT NULL,
    so_dien_thoai VARCHAR(15),
    ngay_sinh DATE,
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
    anh_ho_so_url VARCHAR(255),
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
    anh_ho_so_url VARCHAR(255),
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
    gia_co_ban NUMERIC(10,2) NOT NULL
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

