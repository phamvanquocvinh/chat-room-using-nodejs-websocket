const { User } = require('../models/userModel');
//module lấy list user online
let getOnlineList = async () => {
    const online = await User.find({ status: true }).exec();
    return online;
};

module.exports = { getOnlineList };
  