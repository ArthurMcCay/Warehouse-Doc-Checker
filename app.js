var config = require('./assets/config');

var mongo = require("./modules/mongo.js");
var formatMod = require("./modules/format.js");

var textMod = require('./assets/rus_lang')

// CONFIG VARIABLES SIMPLIFIED
var server1C = config.lc_server;
var chatId = config.chatid;

var express = require('express');
var app = express();
var request = require('request');
var path = require('path');
var TelegramBot = require('node-telegram-bot-api');
var bot = new TelegramBot(config.token, {
  polling: true
});

var handlebars = require('express3-handlebars').create({defaultLayout: 'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.use(express.static(__dirname + '/public'));

app.listen(config.port);
console.log("Running at port: " + config.port);

// Check if Mongo is availiable
mongo.checkConnection();

bot.sendMessage(chatId, '✅ Успешный запуск приложения');

// VARIABLE THAT STORES HIDDEN DATA
var dataMsg = '';

// render home page
app.get('/', function(req, res) {
  // First load / reload
  if (dataMsg === '') {
    // Render empty page
    res.render('foo', {
      layout: 'main'
    });
  } else {
    var obj = JSON.parse(dataMsg);
    // Render page with hidden div
    res.render('foo', {
      layout: 'main',
      result: obj.result,
      warning: obj.warning,
      checks: obj.checks,
      difference: obj.difference,
      lastCheck: obj.lastCheck
    });
    dataMsg = '';
  }
});

///////////////////////////////////////////////////////////////
/// ANSWER FORM QUERRY
app.get('/check', function(req, res) {

  // ISOLATE BAR CODE
  var barCode = req.query.bc;

  // FILTER OUT EMPTY / WRONG QUERRIES
  if (barCode === undefined) {
    return;
  }

  // SEARCH FOR BARCODE IN MONGO AND ACT ACCORDINGLY
  mongo.mSearch(barCode, function(mongoResp) {
    // No entry found in Mongo DB
    if (mongoResp === 'no') {
      // Inserting new record in DB
      mongo.mInsert(barCode, function(mongResp) {
        if (mongResp === 'error') {
          bot.sendMessage(chatId, '❌ Не удалось произвести подключение к Монго!');
        }
      });
      querry1c(barCode, 0, function() {
        res.redirect('/');
      });
    // Entry found in Mongo DB
    } else if (typeof mongoResp === "object") {
      querry1c(barCode, mongoResp, function() {
        res.redirect('/');
      });
    } else {
      querry1c(barCode, 0, function() {
        res.redirect('/');
      });
    }
  });
});

function updHiddenVal(arr) {
  dataMsg = '{"result":"'+ arr[0] + '",' +
            '"warning":"'+ arr[1] + '",' +
            '"checks":"'+ arr[2] + '",' +
            '"difference":"' + arr[3] + '",' +
            '"lastCheck":"' + arr[4] + '"}'
}

function querry1c(barCode, checks, callback) {

  request(server1C + barCode, function(error, response, body) {
    if (error) {
      updHiddenVal(['Нет связи с сервером', textMod.no_response_from_ser, '', '', '']);
      bot.sendMessage(chatId, '‼️ Сервер 1С не отвечает на запрос');
      callback();
      return;
    }

    var obj = JSON.parse(body);
    if (obj.result === 'ok') {
      mongo.mUpdate(barCode, obj, function(mongResp) {
        if (mongResp === 'not found' || mongResp === 'error') {
          bot.sendMessage(chatId, '📛 Не удалось обновить накладную в Монге - проверьте БД!');
        }
      });

      if (checks.checks > 1) {
        bot.sendMessage(chatId, '⚠️ Накладная ' + checks.docNum + ' проверяется ' +
                        checks.checks  + ' раз');
        // TODO: FIX THIS CHECKS.CHECKS
        var dateDiff = formatMod.getDateDif(checks.date);
        var lastCheck = formatMod.dateFormat('' + checks.date);
        updHiddenVal(['Накладная найдена!',
                      textMod.multiple_check_warning,
                      checks.checks,
                      dateDiff,
                      lastCheck]);
      } else {
        updHiddenVal(['Накладная найдена!','','1','','']);
      }
    } else if (obj.result == 'fail' || obj.result == 'error') {

      console.log('Отсканированная накладная ' + barCode +
                  ' не была найдена в базе 1С');

      bot.sendMessage(chatId, '📛 Накладная ' + barCode + ' не была найдена в базе 1С!');

      updHiddenVal(['Накладная НЕ найдена!',
                    textMod.nothing_found_warning,
                    '','','']);
    }
    callback();
  });
}
