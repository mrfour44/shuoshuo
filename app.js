const express = require('express');
const app = express();
const router = require('./router/router.js');
const session = require('express-session');
app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.static('./avatar'));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));
app.get('/', router.showIndex);
app.get('/regist', router.showRegist);
app.get('/login', router.showLogin);
app.get('/setavatar', router.showSetAvatar);
app.get('/cut', router.showCut);
app.post('/doregist', router.doRegist);
app.post('/dologin', router.doLogin);
app.post('/dosetavatar', router.doSetAvatar);
app.get('/doCut', router.doCut);
app.post('/dopost', router.doPost);
app.get('/getallshuoshuo', router.getAllShuoshuo);
app.get('/getuserinfo', router.getUserInfo);
app.get('/allshuoshuocount', router.getAllShuoShuoConunt);
app.listen(3000);