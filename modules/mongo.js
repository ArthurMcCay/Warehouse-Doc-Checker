/* Mongo.js contains functions that deal with
 * connections and queries to the DB
 */
 var exports = module.exports = {};

//var config = require('./assets/config');
var config = require('../assets/config-test');
var mongoCol = config.db_col;

var MongoClient = new require('mongodb').MongoClient;
var assert = require('assert');

// Build url to Mongo DB
var url = 'mongodb://'+config.db_ip+':'+config.db_port+'/'+config.db_name;

// Check if Mongo is up and running
exports.checkConnection = function() {
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log('Successful connection to data base');
    db.close();
  });
}

// search for a bar code
exports.mSearch = function(barCode, callback) {
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);

    if (err) {
      // TODO: MAKE A RECORD IN CONSOLE.LOG FILE
      // TODO: ADD EMOJIS FOR EASIER MONITORING
      console.log('Не удалось произвести подключение к Монго!');
      bot.sendMessage(chatId, 'Не удалось подключиться к Монго!');
      callback('error');
    }

    db.collection(mongoCol).findOne({
      barcode: barCode
    }, function(err, document) {
      if (err) {
        // TODO: MAKE A RECORD IN CONSOLE.LOG FILE
        console.log('Не удалось произвести поиск в Монго!');
        bot.sendMessage(chatId, 'Не удалось произвести поиск в Монго!');
        callback('fail');
      }
      if (document != null || document != undefined) {
        callback(document);
      } else {
        callback('no');
      }
    });
    db.close;
  });
}

exports.mInsert = function(barCode, callback) {
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);

    if (err) {
      // TODO: MAKE A RECORD IN CONSOLE.LOG FILE
      console.log('Не удалось произвести подключение к Монго!');
      callback('error');
    }

    // Create new doc
    var newDoc = {
      barcode: barCode,
      checks: 1,
      date: new Date()
    };

    // Insert new doc into the db
    db.collection(mongoCol).insert(newDoc, {
      w: 1
    }, function(err, records) {
        if (err) {
          // TODO: LOG IT!
          console.log('Ошибка при попытки добавить новую запись в БД')
          callback('error');
        } else {
          callback('created');
        }
    });
    db.close;
  });
}

exports.mUpdate = function(barCode, lcData, callback) {
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);

    if (err) {
      // TODO: MAKE A RECORD IN CONSOLE.LOG FILE
      // TODO: ADD EMOJIS FOR EASIER MONITORING
      console.log('Не удалось произвести подключение к Монго!');
      bot.sendMessage(chatId, 'Не удалось произвести подключение к Монго!');
      callback('error');
    }

    var checksNew;

    db.collection(mongoCol).findOne({
      barcode: barCode
    }, function(err, document) {
      if (err) {
        // TODO: MAKE A RECORD IN CONSOLE.LOG FILE
        console.log('Не могу обновить запись в Монге - Не найден док!');
        callback('not found');
      } else {
        checksNew = document.checks + 1;
        db.collection(mongoCol).update({
          barcode: barCode
        }, {
          barcode: barCode,
          checks: checksNew,
          date: new Date(),
          docNum: lcData.num,
          docDate: lcData.date,
          docSum: lcData.sum
        });
        callback('updated');
      }
    });
    db.close;
  });
}
