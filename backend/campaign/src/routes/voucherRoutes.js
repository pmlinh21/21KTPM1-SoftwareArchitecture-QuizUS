const express = require('express');
const router = express.Router();
const axios = require('axios');
const Voucher = require('../models/voucher');
const PlayerVoucher = require('../models/playerVoucher');
const Campaign = require('../models/campaign');
const PlayerGame = require('../models/playerGame');
const {
    getActive,
    getVoucherById,
    searchByBrand,
    create,
    update,
    getExchanged,
    exchangeByCoin,
    exchangeByItem,
    use, sendVoucher, getStats, getBrandStats
} = require('../controllers/voucherController');

// Lấy tất cả voucher đang hoạt động
router.get('/active', getActive);

// Thống kê tình trạng voucher (đã sd/ chưa sd/ hết hạn/ tổng gtri)
router.get('/stats', getStats);

// Thống kê tình trạng voucher (đã phát hành/ chưa phát hành/ hết hạn/ tổng gtri)
router.get('/brandStats/:id_brand', getBrandStats);

// Lấy voucher theo id
router.get('/:id_voucher', getVoucherById);

// Tìm kiếm voucher theo brand
router.get('/search/brand/:id_brand', searchByBrand);

// Tạo voucher
router.post('/', create);

// Cập nhật một voucher
router.put('/', update);

// đổi voucher bằng xu
router.post('/exchange/coin', exchangeByCoin);

// đổi voucher bằng mảnh ghép
router.post('/exchange/item', exchangeByItem);

// Lấy tất cả voucher đã đổi của player
router.get('/exchange/:id_player', getExchanged);

// Sử dụng voucher
router.put('/used/:id_playerVoucher', use);

// tặng voucher cho bạn
router.post('/send', sendVoucher);

// lấy tất cả thông báo đến người dùng
router.get('/')

module.exports = router;