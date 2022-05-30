package com.ekayworks.ex.support.utils;

import org.springframework.util.ObjectUtils;

import java.text.DecimalFormat;

public class CommonUtils {
	public static DecimalFormat AMOUNT_FORMAT = new DecimalFormat("###,##0");

    /**
     * 생성자
     */
    private CommonUtils() {}

	public static String getDigit(int count) {
		if(count == 0) count = 1;
		else count += 1;

		String result = "";
		switch ((int)Math.log10(count) + 1) {
			case 1:
				result = "00" + count;
				break;
			case 2:
				result = "0" + count;
				break;
			default:
				result = "" + count;
				break;
		}
		return result;
	}

	public static String  float2fFormat(double val) {
		if(val == 0.0 || Double.isNaN(val) || Double.isInfinite(val)) return "";
		return String.format("%.2f", val);
	}

	public static String addComma(Object val) {
		if(ObjectUtils.isEmpty(val)) return "";
		return AMOUNT_FORMAT.format(val);
	}



}
