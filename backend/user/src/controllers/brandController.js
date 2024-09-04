const db = require('../models/index');
const sequelize = db.sequelize;
const init_models = require('../models/init-models');
const model = init_models(sequelize);

const { Op, literal, fn, col } = require("sequelize");

const { successCode, failCode, errorCode } = require('../config/response');

const signup = async (req, res) => {
  try {
    const { name, field, address, lat, long, username, pwd, phone, email } = req.body;

    const existingBrand = await model.brand.findOne({ where: { [Op.or]: [{ username }, { email }] } });

    if (existingBrand) {
      return failCode(res, null, 'Username hoặc email đã tồn tại.');
    }

    const newBrand = await model.brand.create({
      name, field, address, lat, long, is_active: true, username, pwd, phone, email
    });

    return successCode(res, newBrand, 'Đăng ký brand thành công');
  } catch (error) {
    console.error('Error:', error);
    return errorCode(res);
  }
}

const getAll = async (req, res) => {
  try {
    const brands = await model.brand.findAll();

    return successCode(res, brands, 'Lấy danh sách brand thành công');
  } catch (error) {
    console.error('Error:', error);

    return errorCode(res, 'Không thể lấy danh sách brand');
  }
};

const search = async (req, res) => {
  const { keyword } = req.params;

  try {
    const brands = await model.brand.findAll({
      where: {
        name: {
          [Op.iLike]: `%${keyword}%`
        }
      }
    });

    return successCode(res, brands, 'Tìm kiếm brand thành công');
  } catch (error) {
    console.error('Error:', error);
    return errorCode(res, 'Không thể tìm kiếm brand');
  }
};

module.exports = { signup, getAll, search }