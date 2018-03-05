const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const settings = require('../settings.js'); // 数据库配置
const url = settings.dburl;
const dbName = settings.dbname;
// 数据库连接
function __connect(url, callback) {
    MongoClient.connect(url, (err, client) => {
        assert.equal(null, err);
        console.log('Connected successfully to server');
        callback(err, client);
    })
}

init();
function init() {
    __connect(url, (err, client) => {
        if (err) {
            throw Error('数据库连接失败');
            return;
        }
        const db = client.db(dbName);
        const collection = db.collection('user');
        collection.createIndex({'username': 1}, (err, result) => {
            if (err) {
                return;
            }
            console.log('username创建索引成功');
        })
    })
}
// 插入数据
exports.insertOne = function(collectionName, json, callback) {
    __connect(url, (err, client) => {
        if (err) {
            throw Error('数据库连接失败');
            return;
        }
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        collection.insertOne(json, (err, result) => {
            assert.equal(err, null);
            callback(err, result);
            client.close();
        })
    })
}
// 查找数据
exports.find = function(collectionName, json, C, D) {
    let limitNum, skipNum, callback, sort;
    if (arguments.length == 3) {
        callback = C;
        limitNum = 0;
        skipNum = 0;
    } else if (arguments.length == 4) {
        callback = D;
        let args = C;
        limitNum = args.pageamnount || 0;
        skipNum = args.pageamnount * args.page || 0;
        sort = args.sort;
    } else {
        throw new Error('Function find params is not find');
    }
    __connect(url, (err, client) => {
        if (err) {
            throw Error('数据库连接失败');
            return;
        }
        const db = client.db(dbName);
        db.collection(collectionName).find(json).skip(skipNum).limit(limitNum).sort(sort).toArray((err, docs) => {
            assert.equal(err, null);
            callback(err, docs);
            client.close();
        })
    })
}
// 删除数据
exports.deleteMany = function(collectionName, json, callback) {
    __connect(url, (err, client) => {
        if (err) {
            throw Error('数据库连接失败');
            return;
        }
        const db = client.db(dbName);
        db.collection(collectionName).deleteMany(json, (err, results) => {
            assert.equal(err, null);
            callback(err, results);
            client.close();
        })
    })
}
// update
exports.updateOne = function(collectionName, json1, json2, callback) {
    __connect(url, (err, client) => {
        if (err) {
            throw Error('数据库连接失败');
            return;
        }
        const db = client.db(dbName);
        db.collection(collectionName).updateOne(json1, json2, (err, results) => {
            assert.equal(err, null);
            callback(err, results);
            client.close();
        })
    })
}
// 获取documents数量
exports.getAllCount = function(collectionName, callback) {
    __connect(url, (err, client) => {
        if (err) {
            throw Error('数据库连接失败');
            return;
        }
        const db = client.db(dbName);
        db.collection(collectionName).count({}, null, (err, result) => {
            assert.equal(err, null);
            callback(err, result);
            client.close();
        })
    })
}