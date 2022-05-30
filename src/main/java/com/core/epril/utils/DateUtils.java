package com.core.epril.utils;

import javax.xml.datatype.XMLGregorianCalendar;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.TimeZone;

public class DateUtils {
	public static DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
	public static DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

	public static String convertDateTime(Date date) {
		return convert(date, "yyyy-MM-dd HH:mm:ss");
	}

	public static String convertDateTime(Date date, TimeZone timeZone) {
		return convert(date, "yyyy-MM-dd HH:mm:ss", timeZone);
	}

	public static Date convertDateTime(String date) throws ParseException {
		if (date == null) return null;

		if (date.trim().length() == 10) date = date.trim() + " 00:00:00";

		DateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

		return format.parse(date);
	}

	public static String convertDate(Date date) {
		return convert(date, "yyyy-MM-dd");
	}

	public static String convertDate(LocalDate date) {
		return date.format(DATE_FORMATTER);
	}

	public static String convertSimpleDate(Date date) {
		return convert(date, "yyyyMMdd");
	}

	public static Date convertDate(String date) {
		if (date == null) return null;

		date = date.replace('-','/');

		try {
			DateFormat format = new SimpleDateFormat("yyyy-MM-dd");
			return format.parse(date);
		}
		catch(ParseException e) {
			throw new RuntimeException(e);
		}
	}

	public static Date convertDateFromDDMMYY(String date) {
		if (date == null) return null;

		try {
			DateFormat format = new SimpleDateFormat("ddMMyy");
			return format.parse(date);
		}
		catch(ParseException e) {
			throw new RuntimeException(e);
		}
	}

	public static Date convertDateFromDD_MM_YYYY(String date) {
		if (date == null) return null;

		try {
			DateFormat format = new SimpleDateFormat("dd/MM/yyyy");
			return format.parse(date);
		}
		catch(ParseException e) {
			throw new RuntimeException(e);
		}
	}

	public static String convert(Date date, String pattern) {
		if (date == null) return null;

		DateFormat format = new SimpleDateFormat(pattern);

		return format.format(date);
	}

	public static String convert(Date date, String pattern, TimeZone timeZone) {
		if (date == null) return null;

		DateFormat format = new SimpleDateFormat(pattern);
		format.setTimeZone(timeZone);

		return format.format(date);
	}

	public static String nullSafeConvert(Date date, String pattern) {
		String ret = convert(date, pattern);
		return (ret == null) ? "" : ret;
	}

	public static Date today() {
		Calendar c = Calendar.getInstance();
		c.setTime(new Date());
		c.set(Calendar.HOUR_OF_DAY, 0);
		c.set(Calendar.MINUTE, 0);
		c.set(Calendar.SECOND, 0);
		c.set(Calendar.MILLISECOND, 0);
		return c.getTime();
	}

	public static Date today(TimeZone timeZone) {
		Calendar c = Calendar.getInstance(timeZone);
		c.setTime(new Date());
		c.set(Calendar.HOUR_OF_DAY, 0);
		c.set(Calendar.MINUTE, 0);
		c.set(Calendar.SECOND, 0);
		c.set(Calendar.MILLISECOND, 0);
		return c.getTime();
	}

	public static Date dateOnly(Date day) {
		Calendar c = Calendar.getInstance();
		c.setTime(day);
		c.set(Calendar.HOUR_OF_DAY, 0);
		c.set(Calendar.MINUTE, 0);
		c.set(Calendar.SECOND, 0);
		c.set(Calendar.MILLISECOND, 0);
		return c.getTime();
	}

	public static Date dateOnly(Date day, TimeZone timeZone) {
		Calendar c = Calendar.getInstance(timeZone);
		c.setTime(day);
		c.set(Calendar.HOUR_OF_DAY, 0);
		c.set(Calendar.MINUTE, 0);
		c.set(Calendar.SECOND, 0);
		c.set(Calendar.MILLISECOND, 0);
		return c.getTime();
	}

	public static Calendar makeDateOnly(Calendar c) {
		c.set(Calendar.HOUR_OF_DAY, 0);
		c.set(Calendar.MINUTE, 0);
		c.set(Calendar.SECOND, 0);
		c.set(Calendar.MILLISECOND, 0);
		return c;
	}


	public static Date lastTime(Date day) {
		Calendar c = Calendar.getInstance();
		c.setTime(day);
		c.set(Calendar.HOUR_OF_DAY, 23);
		c.set(Calendar.MINUTE, 59);
		c.set(Calendar.SECOND, 59);
		c.set(Calendar.MILLISECOND, 999);
		return c.getTime();
	}

	public static Date nextDay(Date day) {
		Calendar c = Calendar.getInstance();
		c.setTime(day);
		c.add(Calendar.DATE, 1);
		return c.getTime();
	}

	public static Date nextWeek(Date day) {
		Calendar c = Calendar.getInstance();
		c.setTime(day);
		c.add(Calendar.DATE, 7);
		return c.getTime();
	}

	public static Date day(int year, int month, int day) {
		return new GregorianCalendar(year, month-1, day).getTime();
	}

	public static Date day(int year, int month, int day, int hour, int minute, int second) {
		return new GregorianCalendar(year, month-1, day, hour, minute, second).getTime();
	}

	public static Date nextFortnight(Date day) {
		Calendar c = Calendar.getInstance();
		c.setTime(day);
		c.add(Calendar.DATE, 14);
		return c.getTime();
	}

	public static Date nextMonth(Date day) {
		Calendar c = Calendar.getInstance();
		c.setTime(day);
		c.add(Calendar.MONTH, 1);
		return c.getTime();
	}

	public static Date nextBiMonth(Date day) {
		Calendar c = Calendar.getInstance();
		c.setTime(day);
		c.add(Calendar.MONTH, 2);
		return c.getTime();
	}

	public static Date nextQuarter(Date day) {
		Calendar c = Calendar.getInstance();
		c.setTime(day);
		c.add(Calendar.MONTH, 3);
		return c.getTime();
	}

	public static Date nextHalfYear(Date day) {
		Calendar c = Calendar.getInstance();
		c.setTime(day);
		c.add(Calendar.MONTH, 6);
		return c.getTime();
	}

	public static Date nextYear(Date day) {
		Calendar c = Calendar.getInstance();
		c.setTime(day);
		c.add(Calendar.YEAR, 1);
		return c.getTime();
	}

	public static String toDDMMYY(Date day) {
		if (day == null) return null;

		DateFormat format = new SimpleDateFormat("ddMMyy");

		return format.format(day);
	}

	public static String toYYYYMMDD_HHMMSS(Date day) {
		if (day == null) return null;

		DateFormat format = new SimpleDateFormat("yyyyMMdd-HHmmss");

		return format.format(day);
	}

	public static int hour() {
		Calendar c = Calendar.getInstance();
		c.setTime(new Date());
		return c.get(Calendar.HOUR_OF_DAY);
	}

	public static Date getLastTimeFromDDMMYY(String date) {
		Calendar c = Calendar.getInstance();
		c.setTime(convertDateFromDDMMYY(date));
		c.set(Calendar.HOUR_OF_DAY, 23);
		c.set(Calendar.MINUTE, 59);
		c.set(Calendar.SECOND, 59);
		return c.getTime();
	}

	public static Date addDate(Date day, int days) {
		Calendar c = Calendar.getInstance();
		c.setTime(day);
		c.add(Calendar.DATE, days);
		return c.getTime();
	}

	public static Date prevDay(Date day) {
		Calendar c = Calendar.getInstance();
		c.setTime(day);
		c.add(Calendar.DATE, -1);
		return c.getTime();
	}

	public static Date firstDayOfMonth(Date day) {
		Calendar c = Calendar.getInstance();
		c.setTime(day);
		makeDateOnly(c);
		c.set(Calendar.DAY_OF_MONTH, 1);
		return c.getTime();
	}

	public static Date lastDayOfMonth(Date day) {
		Calendar c = Calendar.getInstance();
		c.setTime(day);
		makeDateOnly(c);
		c.set(Calendar.DAY_OF_MONTH, 1);
		c.add(Calendar.MONTH, 1);
		c.add(Calendar.DATE, -1);
		return c.getTime();
	}

	public static Date lastMonth(Date day) {
		Calendar c = Calendar.getInstance();
		c.setTime(day);
		makeDateOnly(c);
		c.set(Calendar.DAY_OF_MONTH, 1);
		c.add(Calendar.MONTH, -1);
		return c.getTime();
	}

	public static int yearmonth(Date day) {
		Calendar c = Calendar.getInstance();
		c.setTime(day);
		makeDateOnly(c);
		return c.get(Calendar.YEAR) * 100 + (c.get(Calendar.MONTH)+1);
	}

	public static Date yearmonth(int yearmonth) {
		Calendar c = Calendar.getInstance();
		c.set(Calendar.YEAR, yearmonth / 100);
		c.set(Calendar.MONTH, (yearmonth % 100)-1);
		c.set(Calendar.DAY_OF_MONTH, 1);
		c.set(Calendar.HOUR_OF_DAY, 0);
		c.set(Calendar.MINUTE, 0);
		c.set(Calendar.SECOND, 0);
		c.set(Calendar.MILLISECOND, 0);
		return c.getTime();
	}


	public static Date now() {
		return new Date();
	}

	public static boolean sameDay(Date day, XMLGregorianCalendar cal) {
		if (day(cal.getYear(), cal.getMonth(), cal.getDay()).equals(dateOnly(day))) {
			return true;
		}
		else {
			return false;
		}
	}

	public static Date day(XMLGregorianCalendar cal) {
		return day(cal.getYear(), cal.getMonth(), cal.getDay());
	}

	public static int diffDays(Date d1, Date d2) {
		return (int)((d2.getTime() - d1.getTime()) / 1000L / 3600L / 24L);
	}

	public static boolean after330PM(Date now) {
		Calendar c = Calendar.getInstance();
		c.setTime(now);

		return c.get(Calendar.HOUR_OF_DAY) >= 16 ||										// after 4:00PM
				(c.get(Calendar.HOUR_OF_DAY) == 15 && c.get(Calendar.MINUTE) >= 30); 		// 3:30PM~3:59PM
	}

	public static Date changeTimeZone(Date date, TimeZone from, TimeZone to) {
		Calendar c = Calendar.getInstance(to);
		c.setTime(date);

		Calendar c2 = Calendar.getInstance(from);
		c2.set(Calendar.YEAR, c.get(Calendar.YEAR));
		c2.set(Calendar.MONTH, c.get(Calendar.MONTH));
		c2.set(Calendar.DATE, c.get(Calendar.DATE));
		c2.set(Calendar.HOUR_OF_DAY, c.get(Calendar.HOUR_OF_DAY));
		c2.set(Calendar.MINUTE, c.get(Calendar.MINUTE));
		c2.set(Calendar.SECOND, c.get(Calendar.SECOND));
		c2.set(Calendar.MILLISECOND, c.get(Calendar.MILLISECOND));

		return c2.getTime();
	}

	public static TimeZone DEFAULT = TimeZone.getDefault();
	public static TimeZone BRISBANE = TimeZone.getTimeZone("Australia/Brisbane");
	public static TimeZone SYDNEY = TimeZone.getTimeZone("Australia/Sydney");
	public static TimeZone SEOUL = TimeZone.getTimeZone("Asia/Seoul");

	public static Date merge(Date day, Date time) {
		Calendar timeC = Calendar.getInstance();
		timeC.setTime(time);

		Calendar dayC = Calendar.getInstance();
		dayC.setTime(day);

		dayC.set(Calendar.HOUR_OF_DAY, timeC.get(Calendar.HOUR_OF_DAY));
		dayC.set(Calendar.MINUTE, timeC.get(Calendar.MINUTE));
		dayC.set(Calendar.SECOND, timeC.get(Calendar.SECOND));
		dayC.set(Calendar.MILLISECOND, timeC.get(Calendar.MILLISECOND));

		return dayC.getTime();
	}

	public static boolean isToday(Date day) {
		return DateUtils.dateOnly(day).equals(DateUtils.today());
	}

	public static Date monthFrom(Date date, int offset) {
		Calendar c = Calendar.getInstance();
		c.setTime(date);
		c.add(Calendar.MONDAY, offset);

		c.set(Calendar.DATE, 1);
		c.set(Calendar.HOUR_OF_DAY, 0);
		c.set(Calendar.MINUTE, 0);
		c.set(Calendar.SECOND, 0);
		c.set(Calendar.MILLISECOND, 0);
		return c.getTime();
	}

	public static Date monthTo(Date day, int offset) {
		Calendar c = Calendar.getInstance();
		c.setTime(day);
		c.add(Calendar.MONDAY, offset);

		c.setTime(lastDayOfMonth(c.getTime()));

		c.set(Calendar.HOUR_OF_DAY, 23);
		c.set(Calendar.MINUTE, 59);
		c.set(Calendar.SECOND, 59);
		c.set(Calendar.MILLISECOND, 999);
		return c.getTime();
	}

	public static Date lastYear() {
		Calendar c = Calendar.getInstance();
		c.setTime(new Date());
		c.add(Calendar.YEAR, -1);

		return c.getTime();
	}

	public static String toDDMMYYYY(Date day) {
		if (day == null) return null;
		DateFormat format = new SimpleDateFormat("ddMMyyyy");
		return format.format(day);
	}

	public static String australianDate(Date today) {
		return convert(today, "dd MMM yyyy");
	}

	public static boolean isPast(String day) {
		Date d = DateUtils.convertDate(day);
		return d.before(today());
	}

	public static Integer[] daysOfMonth(Date baseDay, int day) {
		Calendar c = Calendar.getInstance();
		c.setTime(lastDayOfMonth(baseDay));
		int lastDay = c.get(Calendar.DAY_OF_MONTH);
		if (day < lastDay) return new Integer[] {day};
		else {
			Integer[] days = new Integer[31-lastDay+1];
			for(int i=day; i<=31; i++) {
				days[i-day] = i;
			}
			return days;
		}
	}

	public static int day() {
		Calendar c = Calendar.getInstance();
		c.setTime(new Date());
		return c.get(Calendar.DAY_OF_MONTH);
	}

	public static Date koreanNow() {
		return changeTimeZone(new Date(), DateUtils.DEFAULT, DateUtils.SEOUL);
	}

	public static Date addMonths(Date day, int m) {
		Calendar c = Calendar.getInstance();
		c.setTime(day);
		c.add(Calendar.MONTH, m);
		return c.getTime();
	}

	public static Date addHours(Date day, int h) {
		Calendar c = Calendar.getInstance();
		c.setTime(day);
		c.add(Calendar.HOUR_OF_DAY, h);
		return c.getTime();
	}

	public static Date addJustBeforeHours(Date day, int h) {
		Calendar c = Calendar.getInstance();
		c.setTime(day);
		c.add(Calendar.HOUR_OF_DAY, h);
		c.add(Calendar.MILLISECOND, -1);
		return c.getTime();
	}

	public static Date addWeeks(Date day, int w) {
		Calendar c = Calendar.getInstance();
		c.setTime(day);
		c.add(Calendar.WEEK_OF_YEAR, w);
		return c.getTime();

	}

	public static String convertToYYMMDD(Date date) {
		return convert(date, "yyMMdd");
	}

	/**
	 * 이달의 1일 돌려준다.
	 * @return
	 */
	public static Date getThisMonth() {
		Calendar c = Calendar.getInstance();
		c.setTime(today());
		c.set(Calendar.DATE, 1);
		return c.getTime();
	}

	public static int getYear(Date date) {
		Calendar c = Calendar.getInstance();
		c.setTime(date);
		return c.get(Calendar.YEAR);
	}

	public static int getMonth(Date date) {
		Calendar c = Calendar.getInstance();
		c.setTime(date);
		return c.get(Calendar.MONTH);
	}

	public static int getWeekDay(Date date) {
		Calendar c = Calendar.getInstance();
		c.setTime(date);
		return c.get(Calendar.DAY_OF_WEEK);
	}

	public static Date firstWeekDay(Date d) {
		while(getWeekDay(d) != 2) {	// monday
			d = DateUtils.addDate(d, -1);
		}
		return d;
	}

	public static int hourDiff(Date st, Date end) {
		return (int)((end.getTime() - st.getTime()) / 1000 / 60 / 60);
	}

	public static int minDiff(Date st, Date end) {
		return ((int)(end.getTime() - st.getTime()) / 1000 / 60) % 60;
	}

	public static void main(String[] args) {
//		System.out.println(DateUtils.between(day(2000,1,1,10,10,10), day(2000,1,1,10,0,0), day(2010,1,1,11,0,0)));
//		System.out.println(DateUtils.between(day(2000,1,1,12,10,10), day(2000,1,1,10,0,0), day(2010,1,1,11,0,0)));
		System.out.println(seconds(day(2001,1,1,10,10,10),day(2001,1,2,10,11,10)));
	}

	public static Date addSeconds(Date day, int seconds) {
		Calendar c = Calendar.getInstance();
		c.setTime(day);
		c.add(Calendar.SECOND, seconds);
		return c.getTime();
	}

	public static Times parseTimeStr(String time) {
		int hour = Utils.parseInt(time.substring(0, 2));
		int min = Utils.parseInt(time.substring(3, 5));
		int sec = Utils.parseInt(time.substring(6, 8));

		return new Times(hour, min, sec);
	}

	public static class Times {
		public int hour;
		public int min;
		public int sec;
		public Times(int hour, int min, int sec) {
			this.hour = hour;
			this.min = min;
			this.sec = sec;
		}
		public boolean isInvalid() {
			return hour < 0 || hour > 23 || min < 0 || min > 59 || sec < 0 || sec > 59;
		}
		public Date addTimes(Date day) {
			return DateUtils.addSeconds(day, hour * 60 * 60 + min * 60 + sec);
		}
		@Override
		public String toString() {
			return "Times [hour=" + hour + ", min=" + min + ", sec=" + sec
					+ "]";
		}
	}

	public static boolean between(Date time, Date start, Date finish) {
		if (time == null || start == null || finish == null) return false;

		return ((time.equals(start) || time.after(start)) &&
				(time.equals(finish) || time.before(finish)));
	}

	public static int seconds(Date from, Date to) {
		if (to == null || from == null) return 0;
		return (int)((to.getTime() - from.getTime()) / 1000);
	}

	/* ****************************************
	 *  convert secs to hh:mm:ss
	 * ****************************************/
	public static int hour(int sec) {
		return sec / 60 / 60;
	}

	public static int min(int sec) {
		return (sec - (hour(sec) * 60 * 60)) / 60;
	}

	public static int sec(int sec) {
		return  sec - hour(sec) * 60 * 60 - min(sec) * 60;
	}

	public static String hhmmss(int sec) {
		return String.format("%02d:%02d:%02d", hour(sec), min(sec), sec(sec));
	}

}
