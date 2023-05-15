//Require các module cần thiết
const express = require("express");
const path = require("path");
const bodyParser = require('body-parser');
const session = require('express-session');
const exphbs  = require('express-handlebars');
const flash = require('connect-flash');

//khởi tạo app express
const app = express();

//tạo máy chủ HTTP
const server = require("http").createServer(app);

//kết nối database
const db = require('./public/config/db');

//yêu cầu routes 
const routes = require('./public/routes');

//tạo kết nối socket
const socketio = require('socket.io');
const io  = socketio(server);

//tạo session
app.use(session({
    secret: 'mysecretkey',
    resave: false,
    saveUninitialized: true
  }));
//sử dụng flash message
app.use(flash());
//chia sẻ sesson giữa ứng dụng web và các kết nối socket
const sharedSession = require('express-socket.io-session');


const sessionMiddleware = session({
  secret: 'mysecretkey',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
});
app.use(sessionMiddleware);

// sử dụng sessionMiddleware để chia sẻ session giữa socket và http
io.use(sharedSession(sessionMiddleware, {
    autoSave:true
}));
io.use((socket, next) => {
    sessionMiddleware(socket.request, socket.request.res, next);
});

app.use((req, res, next) => {
    req.io = io; // gán biến io vào request
    next();
  });
// Sử dụng body-parser để xử lý các request có body dạng JSON hoặc x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

// Sử dụng express static để phục vụ các file tĩnh trong thư mục public
app.use(express.static(path.join(__dirname+"/public")));

// Sử dụng routes cho các URL
app.use('/', routes);
app.use('/login', routes);
app.use('/register', routes);
app.use('/home', routes);


// Tạo instance của express-handlebars
const hbs = exphbs.create({
    defaultLayout: 'layout',
    extname: '.hbs',
    helpers: {
        toJSON : function(object) {
            return JSON.stringify(object);
        }
    },
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    },
    partialsDir: [
      'public/views/partials/'
    ]
  });
// Sử dụng express-handlebars
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '/public/views'));

// Require socket controller và gọi nó với instance của socket.io
require('./public/app/controllers/socketController')(io);

// Bắt đầu lắng nghe các kết nối từ client
server.listen(8080, () => {
    console.log('Server started on port 8080');
});