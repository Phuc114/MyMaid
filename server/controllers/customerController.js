const db = require('../config/db'); // Adjust path to your db configuration

const  getCustomers = async (req, res) => {
    try {
      const { search, sort } = req.query;
      
      let query = 'SELECT * FROM khach_hang';
      let params = [];
      
      // Add search filter if provided
      if (search) {
        query += ` WHERE 
          ho_ten ILIKE $1 OR 
          email ILIKE $1 OR 
          so_dien_thoai ILIKE $1`;
        params.push(`%${search}%`);
      }
      
      // Add sorting
      if (sort === 'oldest') {
        query += ' ORDER BY ngay_tao ASC';
      } else {
        query += ' ORDER BY ngay_tao DESC'; // default: newest
      }
      
      const { rows } = await db.query(query, params);
      res.json(rows);
      
    } catch (error) {
      console.error('Lỗi khi lấy danh sách khách hàng:', error);
      res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
};

  // Get customer by ID
const getCustomerById = async (req, res) => {
	try {
	const { id } = req.params;
	const { rows } = await db.query('SELECT * FROM khach_hang WHERE id_khach_hang = $1', [id]);
	
	if (rows.length === 0) {
		return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
	}
	
	res.json(rows[0]);
	
	} catch (error) {
	console.error('Lỗi khi lấy thông tin khách hàng:', error);
	res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
	}
};

  // Update customer
const updateCustomer = async (req, res) => {
	try {
	const { id } = req.params;
	const { ho_ten, email, mat_khau, so_dien_thoai, ngay_sinh, status } = req.body;
	
	const { rows } = await db.query(
		`UPDATE khach_hang 
		SET ho_ten = $1, email = $2, mat_khau = $3, so_dien_thoai = $4, ngay_sinh = $5, status = $6 
		WHERE id_khach_hang = $7 RETURNING *`,
		[ho_ten, email, mat_khau, so_dien_thoai, ngay_sinh, status, id]
	);
	
	if (rows.length === 0) {
		return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
	}
	
	res.json(rows[0]);
	
	} catch (error) {
	console.error('Lỗi khi cập nhật khách hàng:', error);
	res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
	}
};

  // Delete customer
const deleteCustomer = async (req, res) => {
	try {
	const { id } = req.params;
	
	const { rows } = await db.query(
		'DELETE FROM khach_hang WHERE id_khach_hang = $1 RETURNING *',
		[id]
	);
	
	if (rows.length === 0) {
		return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
	}
	
	res.json({ message: 'Xóa khách hàng thành công', customer: rows[0] });
	
	} catch (error) {
	console.error('Lỗi khi xóa khách hàng:', error);
	res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
	}
};

module.exports = {
    getCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer
};
