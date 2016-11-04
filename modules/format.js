/* Format.js contains auxiliary functions
 * that help format dates and other data
 * in a nice user-friendly way
 */

var exports = module.exports = {};

exports.getDateDif = function(date1) {
  var date2 = new Date().getTime();
  var diffInSec = Math.floor((date2 - date1) / 1000);
  if (diffInSec <= 60) {
	return 'Последняя проверка была ' + diffInSec + ' сек. назад';
  } else if (diffInSec < 60 * 60) {
  	return 'Последняя проверка была ' + Math.floor(diffInSec / 60) + ' мин. назад';
  } else if (diffInSec < 3600 * 24) {
  	return 'Последняя проверка была ' + Math.floor(diffInSec / (60 * 60)) + ' ч. назад';
  } else {
  	return 'Последняя проверка была более месяца назад';
  }
  return diffInSec;
}

exports.dateFormat = function(dat) {
	var arr = dat.split(" ");
	var day = arr[2];
	var month;
	var year = arr[3];
	var timeArr = arr[4].split(':');
	var time = timeArr[0] + ':' + timeArr[1];

	switch (arr[1]) {
		case 'Jan':
			month = 'января';
			break;
		case 'Feb':
			month = 'февраля';
			break;
		case 'Mar':
			month = 'марта';
			break;
		case 'Apr':
			month = 'апреля';
			break;
		case 'May':
			month = 'мая';
			break;
		case 'Jun':
			month = 'июня';
			break;
		case 'Jul':
			month = 'июля';
			break;
		case 'Aug':
			month = 'августа';
			break;
		case 'Sep':
			month = 'сентября';
			break;
		case 'Oct':
			month = 'октября';
			break;
		case 'Nov':
			month = 'ноября';
			break;
		case 'Dec':
			month = 'декабря';
			break;
		default:
			break;
	}

	return 'В ' + time + " " + day + " " + month + " " + year + 'г.';
}
