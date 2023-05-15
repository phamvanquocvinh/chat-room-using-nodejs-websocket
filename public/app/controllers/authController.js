const { User } = require('../models/userModel.js');
const { Message }= require('../models/messageModel.js');

const { getOnlineList } = require('./socketGetOnlineController.js');
//module đăng ký 
exports.register = async (req, res) => {
    try {
        //lấy thông tin từ body
        const {fullname, username, password, confirm_password} = req.body;
        //tìm xem có user nào trùng với username không
        const existingUser = await User.findOne({ username });
        //có thì báo đã có
        if (existingUser) {
            req.flash('error', 'Username already exists');
            return res.redirect('/register');
        }
        //check mật khẩu khớp không
        if (confirm_password != password) {
            req.flash('error', 'Password do not match');
            return res.redirect('/register');
        }

        // Tạo tài khoản mới
        const user = new User({
            username : username,
            fullname : fullname,
            password : password,
        });
        await user.save();
        req.flash('error', 'User created successfully');
        res.redirect('/login');
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

//module đăng nhập
exports.login = async (req, res) => {
    try {
        //lấy thông tin từ bodu
        const { username, password } = req.body;
        //gọi biến io
        const io = req.io;
        //tìm trong database có user nào trùng với thông tin không
        const login = await User.findOne({username: username, password: password}).exec();
        //nếu không tìm được thì báo
        if (!login) {
            req.flash('error', 'Invalid username or password')
            return res.redirect('/login')
        }
        //update online status thành true
        if(await User.findByIdAndUpdate(login._id, { status: true }, { new: true })){
            //tạo các biến cần thiết
            const username = login.username;
            const userId = login._id;
            const fullname = login.fullname;
            req.session.username = username;
            req.session.userId = userId;
            req.session.fullname = fullname;
            let isLoggedIn = false;
            //thiết lập kết nối cho user
            io.on('connection', (socket) => {
                //user sẽ vào phòng onlineusers
                socket.join('onlineusers');
                //lưu userId vào session
                socket.request.session.userId = userId
                //nếu đăng nhập
                if(!isLoggedIn) {
                    //thông báo cho phòng onlineusers
                    io.to('onlineusers').emit('user login', { userId, username });
                    isLoggedIn = true;
                    //lấy danh sách người online
                    socket.on('user connected', async (username) => {
                        const onlineUsers = await getOnlineList();
                        //phát cho user để update online users
                        io.emit('update online users', onlineUsers);
                      });
                    //load tin nhắn ra từ database
                    socket.on('get messages', async () => {
                        const messages = await Message.find().exec();
                        //phát cho server tin nhắn
                        socket.emit('messages', messages);
                    });
                }
               
              });
        
            res.redirect('/home');
        }else{
            console.log('Internal server error');
        }
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
//module đăng xuất
exports.logout = async (req, res) => {
    try {
        //tìm user hiện tại từ session
        const userID = req.session.userId;
        const user = await User.findById({_id: userID});
        //update online status thành false
        if( await User.findByIdAndUpdate(user._id, { status: false }, {new: true})){
            //thông báo tới các users trong onlineusers có user logout và user disconnect
            req.io.to('onlineusers').emit('user logout', user.username);
            req.io.to('onlineusers').emit('user disconnect', user.username);
        }

        //xóa session
        req.session.destroy(err => {
            if (err) {
              console.log(err);
            } else {
                res.redirect('/')
            }
          });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
};


