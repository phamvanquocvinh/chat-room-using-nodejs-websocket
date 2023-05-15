const { Message } = require('../models/messageModel');
const { User } = require('../models/userModel')
//module xử lí io
module.exports = (io) => {
  //thiết lập kết nối cho user
  io.on('connection', (socket) => {
    //khi có messages mới xử lí lưu tin nhắn mới về database
      socket.on('chat message', async (msg) => {
        const newMessage = new Message({
          content: msg.message,
          username: msg.username,
          timestamp: Date.now(),
        });
        newMessage.save();
        //phát tín hiệu cho tất cả user có tin nhắn mới
        io.emit('chat message', msg);
      });
      //khi có người disconnect
      socket.on('user disconnect', async (username) => {
        //tìm user và update online status
        const userFindByName = User.findOne({username: username});
        const user = await User.findByIdAndUpdate(userFindByName._id, ({status: false}))
      });
  });

  }
