const formiable = require('formidable');
const db = require('../models/db.js');
const md5 = require('../models/md5.js');
const gm = require('gm');
const fs = require('fs');
let path = require('path');

// 显示主页
exports.showIndex = function(req, res, next) {
    // 数据库查用户头像
    if (req.session.login == '1') {
        db.find('user', {'username': req.session.username}, (err, result) => {
            if (err) {
                return;
            }
            let avatar = result[0].avatar || 'default.jpg';
            res.render('index', {
                'login': true,
                'username':req.session.username,
                'active': 'home',
                'avatar': avatar
            })
        })
    } else {
        res.render('index', {
            'login': false,
            'username': '',
            'active': 'home',
            'avatar': 'default.jpg'
        });
    }
}

// 显示注册
exports.showRegist = function(req, res, next) {
    res.render('regist', {
        'login': req.session.login == '1' ? true : false,
        'username': req.session.login == '1'? req.session.username : '',
        'active': 'regist'
    });
}

// 显示登录
exports.showLogin = function(req, res, next) {
    res.render('login', {
        'login': req.session.login == '1' ? true : false,
        'username': req.session.login == '1'? req.session.username : '',
        'active': 'login'
    });
}

// 显示头像上传
exports.showSetAvatar = function(req, res, next) {
    res.render('setavatar', {
        'login': req.session.login == '1' ? true : false,
        'username': req.session.login == '1'? req.session.username : '',
        'active': 'avatar' 
    })
}

// 显示头像裁剪
exports.showCut = function(req, res, next) {
    res.render('cut', {
        'avatar': req.session.avatar
    });
}

// 注册业务
exports.doRegist = function(req, res, next) {
    let form = new formiable.IncomingForm();
    form.parse(req, (err, fields, files) => {
        if (err) {
            res.send('-3');
            return;
        }
        let username = fields.username;
        let password = fields.password;
        db.find('user', {'username': username}, (err, result) => {
            if (err) {
                res.send('-3');
                return;
            }
            if (result.length != 0) {
                res.send('-1');
                return;
            } else {
                // 写入数据库
                password = md5(md5(password) + md5(password) + 'kris');
                db.insertOne('user', {
                    'username': username,
                    'password': password,
                    'avatar': 'default.jpg'
                }, (err, result) => {
                    if (err) {
                        res.send('-3');
                        return;
                    }
                    req.session.login = '1';
                    req.session.username = username;
                    res.send('1');
                })
            }
        })
    })
}

// 登录业务
exports.doLogin = function(req, res, next) {
    let form = new formiable.IncomingForm();
    form.parse(req, (err, fields, files) => {
        let username = fields.username;
        let password = fields.password;
        db.find('user', {'username': username}, (err, result) => {
            if (err) {
                res.send('-3');
                return;
            }
            if (result.length == 0) {
                res.send('-1');
                return;
            }
            password = md5(md5(password) + md5(password) + 'kris');
            if (password != result[0].password) {
                res.send('-2')
            } else {
                req.session.login = '1';
                req.session.username = username;
                res.send('1');
            }
        })
    })
}

// 上传头像业务
exports.doSetAvatar = function(req, res, next) {
    let form = new formiable.IncomingForm();
    form.uploadDir = path.normalize(__dirname + '/../avatar');
    form.parse(req, (err, fields, files) => {
        let extname = path.extname(files.avatar.name).toLocaleLowerCase();
        let oldPath = files.avatar.path;
        let newPath = path.normalize(__dirname + '/../avatar/' + req.session.username + extname);
        fs.rename(oldPath, newPath, (err) => {
            if (err) {
                return;
            }
            req.session.avatar = req.session.username + extname;
            res.redirect('/cut');
        })
    })    
}

// 裁剪头像业务
exports.doCut = function(req, res, next) {
    let filename = req.session.avatar;
    let w = req.query.w;
    let h = req.query.h;
    let x = req.query.x;
    let y = req.query.y;
    gm('./avatar/' + filename).crop(w, h, x, y).resize(100, 100, '!').write('./avatar/' + filename, (err) => {
        if (err) {
            console.log(err);
            res.send('-1');
            return;
        }
        // 更新数据库
        db.updateOne('user', {'username': req.session.username}, {
            $set: {
                'avatar': req.session.avatar
            }
        }, (err, result) => {
            if (err) {
                return;
            }
            res.send('1');
        })
    })
}

// 发表业务
exports.doPost = function(req, res, next) {
    let form = new formiable.IncomingForm();
    form.parse(req, (err, fields, files) => {
        let content = fields.content;
        let username = req.session.username;
        if (!content) {
            res.send('-1');
            return;
        }
        db.insertOne('post', {
            'username': username,
            'content': content,
            'datetime': new Date()
        }, (err, result) => {
            if (err) {
                console.log(err);
                return;
            }
            res.send('1');
        })
    })
}

// 获取全部说说
const PAGESIZE = 9
exports.getAllShuoshuo = function(req, res, next) {
    let page = parseInt(req.query.page);
    db.find('post', {}, {
        pageamnount : PAGESIZE,
        page: page,
        sort: { 'datetime': -1 }
    } ,(err, result) => {
        if (err) {
            return;
        }
        res.json({'r': result});
    })
}

// 发表人头像
exports.getUserInfo = function(req, res, next) {
    let username = req.query.username;
    db.find('user',{'username': username}, (err, result) => {
        if(err) {
            return;
        }
        res.json({'r': result});
    })
}

// 获取总条数
exports.getAllShuoShuoConunt = function(req, res, next) {
    db.getAllCount('post', (err, result) => {
        if (err) {
            console.log(err);
            return;
        }
        res.json({'count': result});
    })
}