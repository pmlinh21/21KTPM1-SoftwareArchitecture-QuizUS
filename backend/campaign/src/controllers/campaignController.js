const axios = require('axios');
const Campaign = require('../models/campaign');
const Voucher = require('../models/voucher');
const PlayerLikeCampaign = require('../models/playerLikeCampaign');
const PlayerGame = require('../models/playerGame');
const PlayerVoucher = require('../models/playerVoucher');
const Quiz = require('../models/quiz');
const ItemGift = require('../models/itemGift');
const TurnRequest = require('../models/turnRequest');
const VoucherGift = require('../models/voucherGift');
const PlayerNoti = require('../models/playerNoti');

// Lấy tất cả các chiến dịch
const getAll = async (req, res) => {
    try {
        const campaigns = await Campaign.find();
        res.status(200).json(campaigns);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Lấy tất cả các chiến dịch đang diễn ra
const getInProgress = async (req, res) => {
    try {
        const now = new Date();

        // Lấy tất cả các chiến dịch có start_datetime <= now <= end_datetime
        // order by start_datetime ASC
        const campaigns = await Campaign.find({
            start_datetime: { $lte: now },
            end_datetime: { $gte: now }
        }).sort({ start_datetime: 1 });

        const result = await Promise.all(campaigns.map(async (item) => {
            const id_brand1 = item.id_brand1;
            try {
                const brandResponse = await axios.get(`http://gateway_proxy:8000/user/api/brand/${id_brand1}`);
                return {
                    ...item._doc,
                    brand: brandResponse.data
                };
            } catch (axiosError) {
                throw new Error("Failed to fetch brand information.");
            }
        }));

        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Lấy tất cả các chiến dịch sắp diễn ra
const getIncoming = async (req, res) => {
    try {
        const now = new Date();

        // Lấy tất cả các chiến dịch có start_datetime > now 
        // order by start_datetime ASC
        const campaigns = await Campaign.find({
            start_datetime: { $gte: now },
        }).sort({ start_datetime: 1 });

        const result = await Promise.all(campaigns.map(async (item) => {
            const id_brand1 = item.id_brand1;
            try {
                const brandResponse = await axios.get(`http://gateway_proxy:8000/user/api/brand/${id_brand1}`);
                return {
                    ...item._doc,
                    brand: brandResponse.data
                };
            } catch (axiosError) {
                throw new Error("Failed to fetch brand information.");
            }
        }));

        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Lấy tất cả các chiến dịch của một brand theo id_brand
const getBrandCampaign = async (req, res) => {
    try {
        const campaigns = await Campaign.find({
            $or: [{ id_brand1: req.params.id_brand }, { id_brand2: req.params.id_brand }]
        });
        res.status(200).json(campaigns);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Tìm kiếm chiến dịch
const search = async (req, res) => {
    try {
        const campaigns = await Campaign.find({
            name: new RegExp(req.params.keyword, 'i')
        });

        const result = await Promise.all(campaigns.map(async (item) => {
            const id_brand1 = item.id_brand1;
            try {
                const brandResponse = await axios.get(`http://gateway_proxy:8000/user/api/brand/${id_brand1}`);
                return {
                    ...item._doc,
                    brand: brandResponse.data
                };
            } catch (axiosError) {
                throw new Error("Failed to fetch brand information.");
            }
        }));

        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Tìm kiếm chiến dịch của một brand
const searchByBrand = async (req, res) => {
    try {
        const campaigns = await Campaign.find({
            $and: [
                { $or: [{ id_brand1: req.params.id_brand }, { id_brand2: req.params.id_brand }] },
                { name: new RegExp(req.params.keyword, 'i') }
            ]
        });
        res.status(200).json(campaigns);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Lấy thông tin của một chiến dịch
const getById = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id_campaign);

        if (campaign) {
            const id_brand1 = campaign.id_brand1;
            const id_voucher = campaign.id_voucher; // Lấy id_voucher từ campaign

            try {
                // Fetch brand information
                const brandResponse = await axios.get(`http://gateway_proxy:8000/user/api/brand/${id_brand1}`);

                // Fetch voucher information from MongoDB
                const voucher = await Voucher.findById(id_voucher);

                // Combine the campaign data with the associated brand and voucher information
                const result = {
                    ...campaign._doc,
                    brand: brandResponse.data,
                    voucher: voucher // Thêm thông tin voucher vào kết quả
                };

                res.status(200).json(result);
            } catch (error) {
                res.status(500).json({ message: 'Failed to fetch brand or voucher information.' });
            }
        } else {
            res.status(404).json({ message: 'Campaign not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Tạo một chiến dịch mới
const create = async (req, res) => {
    try {
        const { quiz, campaign } = req.body;

        let newQuiz = null;
        if (quiz && quiz.description && quiz.questions && quiz.questions.length > 0) {
            newQuiz = new Quiz(quiz);
            await newQuiz.save();
        }

        const newCampaign = new Campaign({
            ...campaign,
            id_quiz: newQuiz ? newQuiz._id : null,
        });

        await newCampaign.save();
        res.status(201).json({ message: 'Campaign created successfully', campaign: newCampaign });
    } catch (error) {
        console.error('Error creating campaign with quiz:', error);
        res.status(500).json({ message: 'Error creating campaign', error });
    }
};

// Cập nhật một chiến dịch
const update = async (req, res) => {
    try {
        const { _id } = req.body;

        if (!_id) {
            return res.status(400).json({ message: '_id is required' });
        }

        const updatedCampaign = await Campaign.findByIdAndUpdate(
            _id,
            {
                // id_brand1: req.body.id_brand1,
                // id_brand2: req.body.id_brand2,
                // name: req.body.name,
                // photo: req.body.photo,
                // start_datetime: req.body.start_datetime,
                // end_datetime: req.body.end_datetime,
                // id_voucher: req.body.id_voucher,
                // max_amount_voucher: req.body.max_amount_voucher,
                // given_amount_voucher: req.body.given_amount_voucher,
                // id_quiz: req.body.id_quiz,
                // item1_photo: req.body.item1_photo,
                // item2_photo: req.body.item2_photo,
                // score_award: req.body.score_award
                ...req.body,
                id_voucher: new ObjectId(req.body.id_voucher)
            },
            { new: true, runValidators: true }
        );

        if (!updatedCampaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        res.json(updatedCampaign);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Lấy campaign yêu thích của 1 player
const getPlayerFavorite = async (req, res) => {
    try {
        const playerLikes = await PlayerLikeCampaign.findOne({ id_player: req.params.id_player }).populate('campaigns.id_campaign');

        if (!playerLikes) {
            return res.json([]);
        }

        // Map over the campaigns to get the campaign data and associated brand information
        const result = await Promise.all(playerLikes.campaigns.map(async (like) => {
            const campaign = like.id_campaign;

            try {
                const brandResponse = await axios.get(`http://gateway_proxy:8000/user/api/brand/${campaign.id_brand1}`);
                const brand = brandResponse.data;

                return {
                    _id: like._id,
                    campaign_data: {
                        ...campaign._doc,
                        brand: {
                            ...brand
                        }
                    }
                };
            } catch (axiosError) {
                throw new Error("Failed to fetch brand information.");
            }
        }));

        // Return the structured result
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


//Lấy tất cả campaign có thể đổi thưởng bằng coin
const getRedeemableByCoin = async (req, res) => {
    try {
        const { score } = req.body; // Lấy điểm của người chơi từ BODY của request
        const currentTime = new Date();

        const redeemableCampaigns = await Campaign.find({
            score_award: { $lte: score },
            start_datetime: { $lte: currentTime }, // Campaign đã bắt đầu
            end_datetime: { $gte: currentTime } // Campaign chưa kết thúc
        });

        res.status(200).json(redeemableCampaigns);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy dữ liệu', error });
    }
};

//Lấy tất cả campaign có thể đổi thưởng bằng coin
const getRedeemableByItem = async (req, res) => {
    try {
        const { playerId } = req.body; // Lấy playerId từ body của request

        let NumItem1 = 1;
        let NumItem2 = 1;

        // Tìm tất cả các PlayerGame của người chơi đủ điều kiện đổi thưởng
        const playerGames = await PlayerGame.find({
            id_player: playerId,
            quantity_item1: { $gte: NumItem1 }, // Kiểm tra số lượng item1 >+ NumItem1
            quantity_item2: { $gte: NumItem2 }  // Kiểm tra số lượng item2 >= NumItem2(nếu cần tăng số lượng yêu cầu để đổi thì tăng 2 biến này)
        });

        const campaignIds = playerGames.map(game => game.id_campaign);
        const currentTime = new Date();

        // Tìm tất cả các campaign mà player có thể đổi thưởng dựa trên danh sách id_campaign và thời gian còn hiệu lực
        const redeemableCampaigns = await Campaign.find({
            _id: { $in: campaignIds }, // Chỉ lấy các campaign mà player đã sưu tầm đủ item
            start_datetime: { $lte: currentTime }, // Campaign đã bắt đầu
            end_datetime: { $gte: currentTime } // Campaign chưa kết thúc
        });

        res.status(200).json(redeemableCampaigns);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy dữ liệu', error });
    }
};

// Yêu thích campaign
const like = async (req, res) => {
    const { playerId, campaignId } = req.body;

    if (!playerId || !campaignId) {
        return res.status(400).json({ message: 'Player ID and Campaign ID are required.' });
    }

    try {
        let playerLike = await PlayerLikeCampaign.findOne({ id_player: playerId });

        if (!playerLike) {
            playerLike = new PlayerLikeCampaign({
                id_player: playerId,
                campaigns: [{ id_campaign: campaignId }]
            });
            await playerLike.save();
            return res.status(201).json(playerLike);
        }

        const campaignExists = playerLike.campaigns.some(campaign => campaign.id_campaign.toString() === campaignId);

        if (campaignExists) {
            return res.status(400).json({ message: 'Campaign already liked.' });
        }

        playerLike.campaigns.push({ id_campaign: campaignId });
        await playerLike.save();

        // Thêm thông báo
        const campaign = await Campaign.findById(campaignId);

        const now = new Date();
        const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
        const startTimeMinusOneDay = new Date(campaign.start_datetime.getTime() - oneDayInMilliseconds);

        if (startTimeMinusOneDay > now) {
            const newNotification = new PlayerNoti({
                id_receiver: playerId,
                type: 'campaign',
                name_campaign: campaign.name, // Storing the campaign name
                id_campaign: campaignId,      // Storing the campaign ID
                start_time: campaign.start_datetime,
                noti_time: startTimeMinusOneDay,               
                seen_time: null,   
            });

            await newNotification.save();
            // console.log({
            //     id_receiver: playerId,
            //     type: 'campaign',
            //     name_campaign: campaign.name, // Storing the campaign name
            //     id_campaign: campaignId,      // Storing the campaign ID
            //     start_time: campaign.start_datetime,
            //     noti_time: startTimeMinusOneDay,               
            //     seen_time: null,  
            //     subtype: null, 
            // });
        }

        res.status(200).json(playerLike);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Bỏ yêu thích campaign
const unlike = async (req, res) => {
    const { playerId, campaignId } = req.body;

    if (!playerId || !campaignId) {
        return res.status(400).json({ message: 'Player ID and Campaign ID are required.' });
    }

    try {
        const playerLike = await PlayerLikeCampaign.findOne({ id_player: playerId });

        if (!playerLike) {
            return res.status(404).json({ message: 'No likes found for this player.' });
        }

        const campaignIndex = playerLike.campaigns.findIndex(campaign => campaign.id_campaign.toString() === campaignId);

        if (campaignIndex === -1) {
            return res.status(400).json({ message: 'Campaign not found in likes.' });
        }

        playerLike.campaigns.splice(campaignIndex, 1);
        await playerLike.save();

        const deletedNoti = await PlayerNoti.deleteOne({
            id_receiver: playerId,
            type: 'campaign',
            id_campaign: campaignId
        });

        res.json(playerLike);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//lấy tẩt cả campaign của 1 voucher
const getCampaignsOfVoucher = async (req, res) => {
    try {
        const { id_voucher } = req.params;

        const campaigns = await Campaign.find({ id_voucher: id_voucher });

        if (campaigns.length === 0) {
            return res.status(200).json([]);
        }

        const result = await Promise.all(campaigns.map(async (campaign) => {

            try {
                const brandResponse = await axios.get(`http://gateway_proxy:8000/user/api/brand/${campaign.id_brand1}`);
                const brand = brandResponse.data;

                return {
                    ...campaign._doc,
                    brand: {
                        ...brand
                    }
                }
            } catch (axiosError) {
                throw new Error("Failed to fetch brand information.");
            }
        }));

        res.status(200).json({ data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Có lỗi xảy ra trong quá trình lấy campaign.' });
    }
};

const getStats = async (req, res) => {
    try {
        const currentDate = new Date();
        const totalCampaigns = await Campaign.countDocuments();
        const totalVouchers = await Voucher.countDocuments();
        const voucherStats = await PlayerVoucher.aggregate([
            {
                $lookup: {
                    from: 'vouchers',
                    localField: 'id_voucher',
                    foreignField: '_id',
                    as: 'voucherDetails'
                }
            },
            {
                $unwind: '$voucherDetails'
            }
        ]);

        const validUnusedVouchers = voucherStats.reduce((accumulator, item) => {
            const expiryDate = new Date(item.voucherDetails.expired_date);
            if (!item.is_used && expiryDate >= currentDate) {
                accumulator++;
            }
            return accumulator;
        }, 0);

        const validUsedVouchers = voucherStats.reduce((accumulator, item) => {
            const expiryDate = new Date(item.voucherDetails.expired_date);
            if (item.is_used && expiryDate > currentDate) {
                accumulator++;
            }
            return accumulator;
        }, 0);

        const expiredVouchers = voucherStats.reduce((accumulator, item) => {
            const expiryDate = new Date(item.voucherDetails.expired_date);
            if (expiryDate <= currentDate) {
                accumulator++;
            }
            return accumulator;
        }, 0);

        const totalValue = voucherStats.reduce((accumulator, item) => {
            accumulator += item.voucherDetails.price;
            return accumulator;
        }, 0);

        res.status(200).json({
            totalCampaigns,
            totalVouchers,
            totalValue,
            validUsedVouchers,
            validUnusedVouchers,
            expiredVouchers
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Thống kê số lượng người chơi đăng ký/ tham gia sự kiện/ trao đổi vật phẩm từ đầu năm đến tháng gần nhất
const getPlayerStats = async (req, res) => {
    try {
        const startOfYear = getStartOfYear(); // Lấy thời gian đầu năm
        const currentMonth = new Date();

        // Khởi tạo một mảng với số tháng tính từ đầu năm tới hiện tại
        let months = currentMonth.getMonth() + 1; // Lấy số tháng từ đầu năm đến hiện tại
        let recentPlayerCount = new Array(months).fill(0);
        let recentPlayerGames = new Array(months).fill(0);
        let recentItemGifts = new Array(months).fill(0);

        // 1. Số lượng người chơi đăng ký từ đầu năm đến tháng hiện tại
        const playersResponse = await axios.get('http://gateway_proxy:8000/user/api/player');
        const players = playersResponse.data;

        players.forEach(player => {
            const creationTime = new Date(player.creation_time);
            if (creationTime >= startOfYear) {
                const month = creationTime.getMonth(); // Lấy tháng người chơi đăng ký
                // Tăng số lượng người chơi cho các tháng từ tháng hiện tại trở đi
                for (let i = month; i < months; i++) {
                    recentPlayerCount[i]++;
                }
            }
        });

        // 2. Số lượng người chơi tham gia sự kiện từ đầu năm đến tháng hiện tại
        const campaigns = await Campaign.find({
            start_datetime: { $gte: startOfYear }
        }).select('_id start_datetime'); 

        const campaignIds = campaigns.map(campaign => campaign._id);
        //console.log("campaignIds: ", campaignIds);

        const playerGames = await PlayerGame.find({
            id_campaign: { $in: campaignIds }
        }).populate('id_campaign');

        //console.log("playerGames: ", playerGames);

        // Mảng để lưu danh sách người chơi duy nhất cho mỗi tháng
        let uniquePlayersPerMonth = Array.from({ length: months }, () => new Set());

        playerGames.forEach(game => {
            const campaignStart = new Date(game.id_campaign.start_datetime);
            const playerId = game.id_player; 
            const month = campaignStart.getMonth(); 

            // Thêm người chơi vào danh sách duy nhất cho các tháng từ sự kiện bắt đầu trở đi
            for (let i = month; i < months; i++) {
                uniquePlayersPerMonth[i].add(playerId);
            }
        });

        // Đếm số lượng người chơi duy nhất cho mỗi tháng
        uniquePlayersPerMonth.forEach((playerSet, index) => {
            recentPlayerGames[index] = playerSet.size; 
        });

        // 3. Số lượng người chơi trao đổi vật phẩm (tặng item, tặng voucher, tặng lượt chơi) từ đầu năm đến tháng hiện tại
        // Mảng để lưu danh sách người chơi duy nhất cho mỗi tháng
        let uniqueItemGiversAndReceiversPerMonth = Array.from({ length: months }, () => new Set());

        // Lấy dữ liệu từ ItemGift
        const itemGifts = await ItemGift.find({
            gift_time: { $gte: startOfYear }
        });

        itemGifts.forEach(gift => {
            const giftTime = new Date(gift.gift_time);
            const senderId = gift.id_sender; 
            const receiverId = gift.id_receiver; 

            const month = giftTime.getMonth(); 

            // Thêm người chơi (gửi và nhận) vào danh sách duy nhất cho các tháng
            for (let i = month; i < months; i++) {
                uniqueItemGiversAndReceiversPerMonth[i].add(senderId); 
                uniqueItemGiversAndReceiversPerMonth[i].add(receiverId); 
            }
        });

        // Lấy dữ liệu từ VoucherGift
        const voucherGifts = await VoucherGift.find({
            gift_time: { $gte: startOfYear }
        });

        voucherGifts.forEach(gift => {
            const giftTime = new Date(gift.gift_time);
            const senderId = gift.id_sender; 
            const receiverId = gift.id_receiver; 

            const month = giftTime.getMonth(); 

            // Thêm người chơi (gửi và nhận) vào danh sách duy nhất cho các tháng
            for (let i = month; i < months; i++) {
                uniqueItemGiversAndReceiversPerMonth[i].add(senderId); 
                uniqueItemGiversAndReceiversPerMonth[i].add(receiverId); 
            }
        });

        // Lấy dữ liệu từ TurnRequest (những yêu cầu tặng lượt chơi được chấp nhận)
        const turnRequests = await TurnRequest.find({
            reply_time: { $gte: startOfYear },
            is_accept: true // Chỉ tính những yêu cầu đã được chấp nhận
        });

        turnRequests.forEach(turn => {
            const replyTime = new Date(turn.reply_time);
            const senderId = turn.id_sender; 
            const receiverId = turn.id_receiver; 
            const month = replyTime.getMonth(); 

            // Thêm người chơi (gửi và nhận) vào danh sách duy nhất cho các tháng
            for (let i = month; i < months; i++) {
                uniqueItemGiversAndReceiversPerMonth[i].add(senderId);
                uniqueItemGiversAndReceiversPerMonth[i].add(receiverId); 
            }
        });

        // Đếm số lượng người chơi duy nhất cho mỗi tháng
        uniqueItemGiversAndReceiversPerMonth.forEach((playerSet, index) => {
            recentItemGifts[index] = playerSet.size; 
        });

        // Trả về kết quả cho chart
        res.status(200).json({
            recentPlayerCount,         // Số lượng người chơi đăng ký theo tháng
            recentPlayerGames,         // Số lượng người chơi tham gia sự kiện theo tháng
            recentItemGifts            // Số lượng người chơi tặng item, tặng voucher, tặng lượt chơi theo tháng
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

const getStartOfYear = () => {
    const date = new Date();
    date.setMonth(0, 1); 
    date.setHours(0, 0, 0, 0);
    return date;
}

// Thống kê ngân sách đã sử dụng theo lĩnh vực từ đầu năm đến tháng hiện tại
const getBudgetStatsByField = async (req, res) => {
    try {
        const startOfYear = getStartOfYear();
        const currentMonth = new Date();

        let budgetStats = {
            restaurant: new Array(currentMonth.getMonth() + 1).fill(0), // Nhà hàng
            cafe: new Array(currentMonth.getMonth() + 1).fill(0),       // Cafe & Bánh
            shopping: new Array(currentMonth.getMonth() + 1).fill(0),   // Mua sắm
            entertainment: new Array(currentMonth.getMonth() + 1).fill(0) // Giải trí
        };

        const brandResponse = await axios.get('http://gateway_proxy:8000/user/api/brand');
        const brands = brandResponse.data;

        // Lọc các thương hiệu theo lĩnh vực
        const brandGroups = {
            restaurant: brands.filter(brand => brand.field === "Nhà hàng"),
            cafe: brands.filter(brand => brand.field === "Cafe & Bánh"),
            shopping: brands.filter(brand => brand.field === "Mua sắm"),
            entertainment: brands.filter(brand => brand.field === "Giải trí")
        };

        const calculateBudgetForField = async (brandsInField, fieldKey) => {
            for (const brand of brandsInField) {
                const campaigns = await Campaign.find({
                    id_brand1: brand.id_brand, 
                    start_datetime: { $gte: startOfYear }
                }).populate('id_voucher');

                // Tính toán ngân sách đã sử dụng cho mỗi chiến dịch
                campaigns.forEach(campaign => {
                    const voucher = campaign.id_voucher;
                    if (voucher) {
                        const voucherPrice = voucher.price || 0;
                        const campaignMaxVoucher = campaign.max_amount_voucher || 0;
                        const budgetForCampaign = campaignMaxVoucher * voucherPrice;

                        const campaignStartMonth = new Date(campaign.start_datetime).getMonth();
                        const monthDiff = currentMonth.getMonth() - campaignStartMonth;
                        if (monthDiff >= 0 && monthDiff < budgetStats[fieldKey].length) {
                            budgetStats[fieldKey][monthDiff] += budgetForCampaign;
                        }
                    }
                });
            }
        };

        // Tính toán ngân sách cho từng lĩnh vực
        await calculateBudgetForField(brandGroups.restaurant, 'restaurant');
        await calculateBudgetForField(brandGroups.cafe, 'cafe');
        await calculateBudgetForField(brandGroups.shopping, 'shopping');
        await calculateBudgetForField(brandGroups.entertainment, 'entertainment');

        // Trả về kết quả
        res.status(200).json(budgetStats);
    } catch (error) {
        console.error('Error fetching budget statistics:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

// Thống kê tình trạng các sự kiện (đang diễn ra/ sắp diễn ra/ đã kết thúc)
const getEventStatsByField = async (req, res) => {
    try {
        const currentDate = new Date();

        // Ongoing campaigns
        const ongoingCampaigns = await Campaign.countDocuments({
            start_datetime: { $lte: currentDate },
            end_datetime: { $gte: currentDate }
        });

        // Upcoming campaigns
        const upcomingCampaigns = await Campaign.countDocuments({
            start_datetime: { $gt: currentDate }
        });

        // Finished campaigns
        const finishedCampaigns = await Campaign.countDocuments({
            end_datetime: { $lt: currentDate }
        });

        // Return statistics
        return res.status(200).json({
            ongoing: ongoingCampaigns,
            upcoming: upcomingCampaigns,
            finished: finishedCampaigns
        });
    } catch (error) {
        console.error('Error fetching event stats:', error);
        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

//Lấy thống kê của brand dashboard
const getBrandStats = async (req, res) => {
    try {
        const { id_brand } = req.params;

        if (!id_brand) {
            return res.status(400).json({ message: 'id_brand is required' });
        }

        // 1. Đếm số lượng campaign thuộc brand (kiểm tra ở cả id_brand1 và id_brand2)
        const campaignCount = await Campaign.countDocuments({ 
            $or: [
                { id_brand1: id_brand },
                { id_brand2: id_brand }
            ]
        });

        // 2. Đếm số lượng người chơi tham gia các campaign của brand
        const campaignIds = await Campaign.find({
            $or: [
                { id_brand1: id_brand },
                { id_brand2: id_brand }
            ]
        }).select('_id');

        const campaignIdArray = campaignIds.map(campaign => campaign._id);

        // Tìm người chơi từ PlayerGame dựa trên các campaign của brand
        const uniquePlayers = await PlayerGame.distinct('id_player', {
            id_campaign: { $in: campaignIdArray }
        });
        const playerCount = uniquePlayers.length;

        // 3. Đếm số lượng mã giảm giá (distinct `id_voucher`) thuộc các campaign của brand
        const uniqueVouchers = await Campaign.distinct('id_voucher', {
            _id: { $in: campaignIdArray }
        });
        const voucherCount = uniqueVouchers.length;

        // Trả về kết quả
        res.status(200).json({
            campaignCount,   // Số lượng campaign
            playerCount,     // Số lượng người chơi tham gia
            voucherCount     // Số lượng mã giảm giá
        });
    } catch (error) {
        console.error('Error fetching brand stats:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

// Thống kê tình trạng các sự kiện (đang diễn ra/ sắp diễn ra/ đã kết thúc)
const getEventStats = async (req, res) => {
    try {
        const { id_brand } = req.params;
        const currentDate = new Date();

        if (!id_brand) {
            return res.status(400).json({ message: 'id_brand is required' });
        }

        // Ongoing campaigns for the brand
        const ongoingCampaigns = await Campaign.countDocuments({
            $or: [
                { id_brand1: id_brand },
                { id_brand2: id_brand }
            ],
            start_datetime: { $lte: currentDate },
            end_datetime: { $gte: currentDate }
        });

        // Upcoming campaigns for the brand
        const upcomingCampaigns = await Campaign.countDocuments({
            $or: [
                { id_brand1: id_brand },
                { id_brand2: id_brand }
            ],
            start_datetime: { $gt: currentDate }
        });

        // Finished campaigns for the brand
        const finishedCampaigns = await Campaign.countDocuments({
            $or: [
                { id_brand1: id_brand },
                { id_brand2: id_brand }
            ],
            end_datetime: { $lt: currentDate }
        });

        // Return statistics for the specific brand
        return res.status(200).json({
            ongoing: ongoingCampaigns,
            upcoming: upcomingCampaigns,
            finished: finishedCampaigns
        });
    } catch (error) {
        console.error('Error fetching brand event stats:', error);
        return res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    };
};

const getBrandPlayerStats = async (req, res) => {
    try {
        const { id_brand } = req.params;

        if (!id_brand) {
            return res.status(400).json({ message: 'id_brand is required' });
        }

        const startOfYear = getStartOfYear(); // Lấy thời gian đầu năm
        const currentMonth = new Date();
        let months = currentMonth.getMonth() + 1; // Lấy số tháng từ đầu năm đến hiện tại
        let recentPlayerCount = new Array(months).fill(0);
        let recentPlayerGames = new Array(months).fill(0);
        let recentItemGifts = new Array(months).fill(0);

        // 1. Số lượng người chơi đăng ký cho brand từ đầu năm đến tháng hiện tại
        const playersResponse = await axios.get(`http://gateway_proxy:8000/user/api/player`);
        const players = playersResponse.data;

        players.forEach(player => {
            const creationTime = new Date(player.creation_time);
            if (creationTime >= startOfYear) {
                const month = creationTime.getMonth(); 
                for (let i = month; i < months; i++) {
                    recentPlayerCount[i]++;
                }
            }
        });

        // 2. Số lượng người chơi tham gia sự kiện của brand từ đầu năm đến tháng hiện tại
        const campaigns = await Campaign.find({
            $or: [
                { id_brand1: id_brand },
                { id_brand2: id_brand }
            ],
            start_datetime: { $gte: startOfYear }
        }).select('_id start_datetime'); 

        const campaignIds = campaigns.map(campaign => campaign._id);

        const playerGames = await PlayerGame.find({
            id_campaign: { $in: campaignIds }
        }).populate('id_campaign');

        let uniquePlayersPerMonth = Array.from({ length: months }, () => new Set());

        playerGames.forEach(game => {
            const campaignStart = new Date(game.id_campaign.start_datetime);
            const playerId = game.id_player; 
            const month = campaignStart.getMonth(); 

            for (let i = month; i < months; i++) {
                uniquePlayersPerMonth[i].add(playerId);
            }
        });

        uniquePlayersPerMonth.forEach((playerSet, index) => {
            recentPlayerGames[index] = playerSet.size; 
        });

        // 3. Số lượng người chơi trao đổi vật phẩm (tặng item, tặng voucher, tặng lượt chơi) cho brand từ đầu năm đến tháng hiện tại
        let uniqueItemGiversAndReceiversPerMonth = Array.from({ length: months }, () => new Set());

        const itemGifts = await ItemGift.find({
            id_campaign: { $in: campaignIds },
            gift_time: { $gte: startOfYear }
        });

        itemGifts.forEach(gift => {
            const giftTime = new Date(gift.gift_time);
            const senderId = gift.id_sender; 
            const receiverId = gift.id_receiver; 
            const month = giftTime.getMonth(); 

            for (let i = month; i < months; i++) {
                uniqueItemGiversAndReceiversPerMonth[i].add(senderId); 
                uniqueItemGiversAndReceiversPerMonth[i].add(receiverId); 
            }
        });

        const voucherGifts = await VoucherGift.find({
            id_campaign: { $in: campaignIds },
            gift_time: { $gte: startOfYear }
        });

        voucherGifts.forEach(gift => {
            const giftTime = new Date(gift.gift_time);
            const senderId = gift.id_sender; 
            const receiverId = gift.id_receiver; 
            const month = giftTime.getMonth(); 

            for (let i = month; i < months; i++) {
                uniqueItemGiversAndReceiversPerMonth[i].add(senderId); 
                uniqueItemGiversAndReceiversPerMonth[i].add(receiverId); 
            }
        });

        const turnRequests = await TurnRequest.find({
            id_campaign: { $in: campaignIds },
            reply_time: { $gte: startOfYear },
            is_accept: true 
        });

        turnRequests.forEach(turn => {
            const replyTime = new Date(turn.reply_time);
            const senderId = turn.id_sender; 
            const receiverId = turn.id_receiver; 
            const month = replyTime.getMonth(); 

            for (let i = month; i < months; i++) {
                uniqueItemGiversAndReceiversPerMonth[i].add(senderId);
                uniqueItemGiversAndReceiversPerMonth[i].add(receiverId); 
            }
        });

        uniqueItemGiversAndReceiversPerMonth.forEach((playerSet, index) => {
            recentItemGifts[index] = playerSet.size; 
        });

        // Trả về kết quả cho chart
        res.status(200).json({
            recentPlayerCount,         // Số lượng người chơi đăng ký theo tháng
            recentPlayerGames,         // Số lượng người chơi tham gia sự kiện theo tháng
            recentItemGifts            // Số lượng người chơi tặng item, tặng voucher, tặng lượt chơi theo tháng
        });
    } catch (error) {
        console.error('Error fetching brand player statistics:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

// Thống kê ngân sách đã sử dụng cho các campaign của brand từ đầu năm đến tháng hiện tại
const getBrandBudgetStats = async (req, res) => {
    try {
        const { id_brand } = req.params;
        if (!id_brand) {
            return res.status(400).json({ message: 'id_brand is required' });
        }

        const startOfYear = getStartOfYear();
        const currentMonth = new Date();
        
        // Khởi tạo mảng để lưu ngân sách sử dụng theo campaign
        let campaignBudgetStats = [];

        // Tìm tất cả các campaign của brand theo id_brand
        const campaigns = await Campaign.find({
            $or: [
                { id_brand1: id_brand },
                { id_brand2: id_brand }
            ],
            start_datetime: { $gte: startOfYear }
        }).populate('id_voucher');

        // Tính toán ngân sách đã sử dụng cho mỗi campaign
        campaigns.forEach(campaign => {
            const voucher = campaign.id_voucher;
            if (voucher) {
                const voucherPrice = voucher.price || 0;
                const campaignMaxVoucher = campaign.max_amount_voucher || 0;
                const campaignGivenVoucher = campaign.given_amount_voucher || 0;

                // Tính tổng ngân sách đã sử dụng (voucher đã phát hành) cho campaign
                const usedBudget = campaignGivenVoucher * voucherPrice;

                // Tổng ngân sách dự kiến của campaign (tổng số lượng voucher dự kiến)
                const totalBudget = campaignMaxVoucher * voucherPrice;

                // Thêm thông tin ngân sách vào mảng campaignBudgetStats
                campaignBudgetStats.push({
                    campaign_id: campaign._id,
                    campaign_name: campaign.name,
                    used_budget: usedBudget,  // Ngân sách đã sử dụng (đã phát hành)
                    total_budget: totalBudget, // Tổng ngân sách dự kiến (tối đa)
                    start_datetime: campaign.start_datetime // Thời gian bắt đầu campaign
                });
            }
        });

        // Trả về kết quả thống kê
        res.status(200).json({
            id_brand: id_brand,
            campaigns: campaignBudgetStats // Ngân sách đã sử dụng cho từng campaign
        });
    } catch (error) {
        console.error('Error fetching brand campaign budget statistics:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};



module.exports = {
    getAll,
    getInProgress,
    getIncoming,
    getBrandCampaign,
    search,
    searchByBrand,
    getById,
    create,
    update,
    getPlayerFavorite,
    getRedeemableByCoin,
    getRedeemableByItem,
    like,
    unlike,
    getCampaignsOfVoucher,
    getStats,
    getCampaignsOfVoucher,
    getPlayerStats,
    getBudgetStatsByField,
    getEventStatsByField,
    getBrandStats,
    getBrandPlayerStats,
    getBrandBudgetStats,
    getEventStats
};
