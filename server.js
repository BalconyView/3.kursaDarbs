const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const jwt = require('jsonwebtoken');
const passport = require('passport');
var cors = require('cors');
const config = require('./config/database');
const api = require('./server/routes/api');
const Room = require('./server/models/room');
const User = require('./server/routes/userRoutes/mainRoutes');
const Rooms = require('./server/routes/roomRoutes/mainRoutes');
const app = express();
const port = 3000;
//const redis = require('socket.io-redis');

let http = require('http').Server(app);

var mongoose = require('mongoose');
var server = app.listen(3000);
var roomHandler = require('./server/handlers/room-handler');
var redis = require('./server/requires/redisDb');

app.use(cors());
app.use(express.static(path.join(__dirname,'dist')));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
app.use('/api',api);
app.use('/rooms',Rooms);
app.use('/user',User);

require('./config/passport')(passport);
 
const io  = require('socket.io')(server);
 
io.adapter(redis.redis({ host: 'localhost', port: 6379 }));

var room_namespace = io.of('/room');
 

 io.on('connection', function(socket){
   
   console.log('server: connected to default namespace');
 });


room_namespace.on('connection',function(socket){
 
 
 Room.getRoomByName(socket.handshake.query['room'] ,(err, room) =>{
   if(!room) return;
  
    roomHandler(socket,redis,room_namespace,io,Rooms);
  
 });
  
  
  
   
  
});
 
 
app.use(function (err, req, res, next) {
  res.redirect('/home');
});
app.get('*', (req,res)=> {

    res.sendFile(path.join(__dirname,'dist/index.html'));

});


 
