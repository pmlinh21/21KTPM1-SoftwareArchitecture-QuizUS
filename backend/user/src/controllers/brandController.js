const db = require('../models/index');
const sequelize = db.sequelize;
const init_models = require('../models/init-models');
const model = init_models(sequelize);
const bcrypt = require('bcryptjs');

const { Op, literal, fn, col } = require("sequelize");

const { successCode, failCode, errorCode } = require('../config/response');

const signup = async (req, res) => {
  try {
    const { name, field, address, lat, long, username, pwd, phone, email, logo } = req.body;

    const existingBrand = await model.brand.findOne({ where: { [Op.or]: [{ email }] } });

    if (existingBrand) {
      return failCode(res, null, 'Email đã tồn tại.');
    }
    
    let passWordHash = bcrypt.hashSync(pwd, 10);
    const newBrand = await model.brand.create({
      name, field, address, lat, long, is_active: true, username, pwd:passWordHash, phone, email,
      logo: logo || 'https://res.cloudinary.com/dklt21uks/image/upload/v1725617785/quizus/w6z4afxecugisynvpiwy.png'
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

// get brand by id
const get = async (req, res) => {
  const { id_brand } = req.params;

  try {
      const brand = await model.brand.findOne({
          where: { id_brand }
      });

      if (brand) {
          successCode(res, brand, "Lấy thông tin brand thành công");
      } else {
          failCode(res, null, "Không tìm thấy brand");
      }
  }
  catch (error) {
      console.error('Error:', error);
      errorCode(res);
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

const update = async (req, res) => {
  const {
    id_brand,
    name,
    field,
    address,
    lat,
    long,
    username,
    pwd,
    phone,
    email,
    logo
  } = req.body; 

  try {
    const brandToUpdate = await model.brand.findOne({
      where: { id_brand }
    });

    if (!brandToUpdate) {
      return failCode(res, null, "id_brand không hợp lệ");
    }

    brandToUpdate.name = name || brandToUpdate.name;
    brandToUpdate.field = field || brandToUpdate.field;
    brandToUpdate.address = address || brandToUpdate.address;
    brandToUpdate.lat = lat || brandToUpdate.lat;
    brandToUpdate.long = long || brandToUpdate.long;
    brandToUpdate.logo = logo || brandToUpdate.logo;
    brandToUpdate.username = username || brandToUpdate.username;
    
    if (pwd) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(pwd, salt);
      brandToUpdate.pwd = hashedPassword;
    } else {
      brandToUpdate.pwd = brandToUpdate.pwd;
    }

    brandToUpdate.phone = phone || brandToUpdate.phone;
    brandToUpdate.email = email || brandToUpdate.email;

    const updatedBrand = await brandToUpdate.save();
    
    return successCode(res, updatedBrand, "Cập nhật thành công");
  } catch (error) {
    console.error('Error:', error);
    return errorCode(res);
  }
};

// Harshing brand password
const updatePassword = async(req,res) => {
  let { id_brand, new_password } = req.body;
  
  try{
    let brand = await model.brand.findOne({
      where: {
        id_brand: id_brand
      }
    });
    if(brand){
      let passWordHash = bcrypt.hashSync(new_password, 10);
      await model.brand.update({
        pwd:passWordHash
      }, {
        where: {
          id_brand: id_brand
        }
      })
      
      let data = await model.brand.findOne({
        where: {
          id_brand:id_brand
        }
      });
      
      successCode(res, data, "Update thành công");
      return;
    }
    else{
      failCode(res, null, "Invalid id")
    }     
  }catch(err){
      errorCode(res,"Lỗi BE")
  }
}

const deactivate = async (req, res) => {
  try {
      const brand = await model.brand.findOne({
          where: {
              id_brand: req.params.id_brand,
          }
      })

      if (brand) {
          brand.is_active = false;
          const updatedBrand = await brand.save();
          successCode(res, updatedBrand, "Khóa thành công")
      } else
          failCode(res, null, "id_brand không hợp lệ")
  } catch (err) {
      console.log(err)
      errorCode(res)
  }
}

const activate = async (req, res) => {
  try {
      const brand = await model.brand.findOne({
          where: {
              id_brand: req.params.id_brand,
          }
      })

      if (brand) {
          brand.is_active = true;   
          const updatedbrand = await brand.save();
          successCode(res, updatedbrand, "Kích hoạt thành công")
      } else
          failCode(res, null, "id_brand không hợp lệ")
  } catch (err) {
      console.log(err)
      errorCode(res)
  }
}

module.exports = { signup, getAll, get, search, update, updatePassword,
  deactivate, activate
 }