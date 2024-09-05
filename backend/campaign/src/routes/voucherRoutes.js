const express = require('express');
const router = express.Router();
const Voucher = require('../models/voucher');
const PlayerVoucher = require('../models/playerVoucher');

// Tìm kiếm voucher theo brand
router.get('/search/:id_brand', async (req, res) => {
  try {
    const vouchers = await Voucher.find({ id_brand: req.params.id_brand });
    res.status(200).json(vouchers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Tạo voucher
router.post('/', async (req, res) => {
  const voucher = new Voucher({
    id_brand: req.body.id_brand,
    code: req.body.code,
    qr_code: req.body.qr_code,
    photo: req.body.photo,
    price: req.body.price,
    description: req.body.description,
    expired_date: req.body.expired_date,
    score_exchange: req.body.score_exchange,
    status: req.body.status
  });

  try {
    const newVoucher = await voucher.save();
    res.status(201).json(newVoucher);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Cập nhật một voucher
router.put('/', async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.body._id);
    if (voucher) {
      voucher.id_brand = req.body.id_brand || voucher.id_brand;
      voucher.code = req.body.code || voucher.code;
      voucher.qr_code = req.body.qr_code || voucher.qr_code;
      voucher.photo = req.body.photo || voucher.photo;
      voucher.price = req.body.price || voucher.price;
      voucher.description = req.body.description || voucher.description;
      voucher.expired_date = req.body.expired_date || voucher.expired_date;
      voucher.score_exchange = req.body.score_exchange || voucher.score_exchange;
      voucher.status = req.body.status != null ? req.body.status : voucher.status;
      
      const updatedVoucher = await voucher.save();
      res.status(200).json(updatedVoucher);
    } else {
      res.status(404).json({ message: 'Voucher not found' });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// lấy tất cả voucher đã đổi của player
router.post('/exchange', async (req, res) => {
  try {
    const id_player = req.body.id_player;
    
    if (!id_player) {
      return res.status(400).json({ message: 'id_player is required' });
    }

    const playerVouchers = await PlayerVoucher.find({ id_player }).populate('id_voucher');

    console.log(playerVouchers);

    if (!playerVouchers || playerVouchers.length === 0) {
      return res.status(404).json({ message: 'No vouchers found for this player.' });
    }

    const currentTime = new Date();

    const result = playerVouchers.map(playerVoucher => {
      const voucher = playerVoucher.id_voucher;

      return {
        id_voucher: voucher._id,
        code: voucher.code,
        qr_code: voucher.qr_code,
        photo: voucher.photo,
        price: voucher.price,
        description: voucher.description,
        expired_date: voucher.expired_date,
        score_exchange: voucher.score_exchange,
        status: voucher.status ? "Còn hạn" : "Hết hạn",
        is_used: playerVoucher.is_used ? "Đã sử dụng" : "Chưa sử dụng"
      };
    });

    res.status(200).json(result);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
