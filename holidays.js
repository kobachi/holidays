"use strict";
(function () {

if (typeof window.holidayManager != "undefined") {
	return;
}

window.holidayManager = new (function () {

/**
 * 日付が固定されている国民の休日
 */
function FixedHoliday(name, month, day) {
	this.name = name;
	this.month = month;
	this.day = day;
}

FixedHoliday.prototype.of = function(year) {
	var d = new Date(year, this.month - 1, this.day);
	d.name = this.name;
	return d;
};

/**
 * M月の第C回目のD曜日に設定された国民の休日
 */
function HappyHoliday(name, month, count, dow) {
	this.name = name;
	this.month = month;
	this.count = count;
	this.dayOfWeek = dow;
}

HappyHoliday.prototype.of = function(year) {
	var w = new Date(year, this.month - 1, 1).getDay() - this.dayOfWeek;
	var d = new Date(year, this.month - 1, (w <= 0 ? this.count - 1 : this.count) * 7 - w + 1);
	d.name = this.name;
	return d;
};

/**
 * 固有のロジックを使う国民の休日
 */
function LogicHoliday(name, logic) {
	this.name = name;
	this.logic = logic;
}

LogicHoliday.prototype.of = function (year) {
	var d = this.logic(year);
	d.name = this.name;
	return d;
};

var SUNDAY = 0;
var MONDAY = 1;
var ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * 国民の休日一覧
 */
var HOLIDAYS = [
	new FixedHoliday("元日", 1, 1),
	new HappyHoliday("成人の日", 1, 2, MONDAY),
	new FixedHoliday("建国記念の日", 2, 11),
	new LogicHoliday("春分の日", function (year) {
		if (year < 2016 || 2099 < year) throw new Error();
		switch (year % 4) {
		case 0: return new Date(year, 2, year < 2092 ? 20 : 19);
		case 1: return new Date(year, 2, 20);
		case 2: return new Date(year, 2, year < 2026 ? 21 : 20);
		case 3: return new Date(year, 2, year < 2059 ? 21 : 20);
		}
	}),
	new FixedHoliday("昭和の日", 4, 29),
	new FixedHoliday("憲法記念日", 5, 3),
	new FixedHoliday("みどりの日", 5, 4),
	new FixedHoliday("こどもの日", 5, 5),
	new HappyHoliday("海の日", 7, 3, MONDAY),
	new FixedHoliday("山の日", 8, 11),
	new HappyHoliday("敬老の日", 9, 3, MONDAY),
	new LogicHoliday("秋分の日", function (year) {
		if (year < 2016 || 2099 < year) throw new Error();
		switch (year % 4) {
		case 0: return new Date(year, 8, year < 2012 ? 23 : 22);
		case 1: return new Date(year, 8, year < 2045 ? 23 : 22);
		case 2: return new Date(year, 8, year < 2078 ? 23 : 22);
		case 3: return new Date(year, 8, 23);
		}
	}),
	new HappyHoliday("体育の日", 10, 2, MONDAY),
	new FixedHoliday("文化の日", 11, 3),
	new FixedHoliday("勤労感謝の日", 11, 23),
	new FixedHoliday("天皇誕生日", 12, 23)
];

/**
 * 指定された年の国民の休日を取得します
 */
this.enumHolidays = function (year) {
	var holidays = HOLIDAYS.map(function (h) { return h.of(year); });
	for (var i = 0; i < holidays.length; i++) {
		var h = holidays[i];
		if (h.getDay() == SUNDAY) {
			// 祝日が日曜日の場合
			var insertPoint;
			// 1日ずらす
			var t = h.getTime() + ONE_DAY_MS;
			// 連休チェックして振替日時探索
			for (insertPoint = i + 1; insertPoint < holidays.length; insertPoint++) {
				if (t < holidays[insertPoint].getTime()) {
					break;
				}
				t += ONE_DAY_MS;
			}
			// 振替休日を挿入
			var substitute = new Date(t);
			substitute.name = h.name + "の振替休日";
			substitute.original = h;
			h.substitute = substitute;
			holidays.splice(insertPoint, 0, substitute);
		}
	}
	return holidays;
};

})();
})();