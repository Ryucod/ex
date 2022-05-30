package com.core.epril.utils;

import com.core.epril.grid.GridReq;
import com.core.epril.grid.GridRes;
import com.google.common.base.Joiner;
import org.modelmapper.ModelMapper;
import org.springframework.util.StringUtils;
import org.springframework.validation.BindingResult;

import javax.servlet.http.HttpServletRequest;
import java.lang.reflect.Array;
import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.util.Collection;
import java.util.List;

public class Utils {
	public static final int INVALID_NUMBER = Integer.MIN_VALUE;
	public static final BigDecimal HUNDRED = BigDecimal.valueOf(100);

	public static String notNull(String str) {
		return str == null ? "" : str;
	}
	
	public static String moneyFormat(BigDecimal unitPrice) {
		if (unitPrice == null)
			return "";
		NumberFormat format = DecimalFormat.getInstance();
		format.setMaximumFractionDigits(2);
		format.setMinimumFractionDigits(2);
		return format.format(unitPrice);
	}

	public static String intFormat(BigDecimal unitPrice) {
		NumberFormat format = DecimalFormat.getInstance();
		format.setMaximumFractionDigits(0);
		return format.format(unitPrice);
	}

	public static String imagePath(HttpServletRequest request) {
		return request.getSession().getServletContext().getRealPath("images");
	}

	public static String extension(String fileName) {
		if (fileName == null)
			return null;
		int pos = fileName.lastIndexOf('.');
		return (pos > 0) ? fileName.substring(pos + 1).toLowerCase() : "";
	}

	public static String lastFour(String cardNo) {
		if (cardNo == null || cardNo.length() < 4)
			return "";
		int length = cardNo.length();
		return cardNo.substring(length - 4);
	}

	public static String trim(String value, int max) {
		if (value == null || value.length() <= max)
			return value;
		return value.substring(0, max);
	}

	public static boolean isTestRunning() {
		for (StackTraceElement ste : Thread.currentThread().getStackTrace()) {
			if (ste.getClassName().startsWith("org.junit.runners")
					|| ste.getClassName().indexOf("com.epril.iinvoice.test") >= 0) {
				return true;
			}
		}
		return false;
	}

	public static boolean isDeveloping() {
		InetAddress addr;
		try {
			addr = InetAddress.getLocalHost();
		} catch (UnknownHostException e) {
			return false;
		}
		byte[] ips = addr.getAddress();
		if (ips[0] == -64)
			return true; // 192-256=-64
		else
			return false;
	}

	public static String mailAddr(String name, String email) {
		if (StringUtils.hasText(email)) {
			name = name.replaceAll(",", "");
			return "\"" + name + "\" <" + email + ">";
		}
		else
			return null;
	}

	public static boolean isNumberOnly(String cardNo) {
		if (cardNo == null || cardNo.length() == 0)
			return false;
		for (int i = 0; i < cardNo.length(); i++) {
			if (cardNo.charAt(i) < '0' || cardNo.charAt(i) > '9')
				return false;
		}
		return true;
	}

	/**
	 * Format balance with DR or CR suffix.
	 * 
	 * @param balance
	 * @return
	 */
	public static String formattedBalance(BigDecimal balance) {
		int compare = balance.compareTo(BigDecimal.ZERO);
		if (compare == 0) {
			return "0.00";
		} else if (compare > 0) {
			return Utils.moneyFormat(balance);
		} else {
			return Utils.moneyFormat(BigDecimal.ZERO.subtract(balance)) + " CR";
		}
	}

	/**
	 * set a private var of an object.
	 * 
	 */
	public static void set(Object obj, String varName, Object value) {
		try {
			Field f = obj.getClass().getDeclaredField(varName);
			f.setAccessible(true);
			f.set(obj, value);
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	/**
	 * set a private var declared in the super class.
	 * 
	 * @param obj
	 * @param varName
	 * @param value
	 */
	public static void setSuper(Object obj, String varName, Object value) {
		try {
			Field f = obj.getClass().getSuperclass().getDeclaredField(varName);
			f.setAccessible(true);
			f.set(obj, value);
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	public static BigDecimal notNull(BigDecimal res) {
		return res == null ? BigDecimal.ZERO : res;
	}

	public static boolean isPlus(BigDecimal paid) {
		return paid != null && paid.compareTo(BigDecimal.ZERO) > 0;
	}

	public static boolean isZero(BigDecimal paid) {
		return paid != null && paid.compareTo(BigDecimal.ZERO) == 0;
	}

	public static boolean isMinus(BigDecimal paid) {
		return paid != null && paid.compareTo(BigDecimal.ZERO) < 0;
	}

	public static boolean gt(BigDecimal b1, BigDecimal b2) {
		if (b1 == null || b2 == null) return false;
		return b1.compareTo(b2) > 0;
	}

	public static boolean ge(BigDecimal b1, BigDecimal b2) {
		if (b1 == null || b2 == null) return false;
		return b1.compareTo(b2) >= 0;
	}

	public static boolean eq(BigDecimal b1, BigDecimal b2) {
		if (b1 == null || b2 == null) return false;
		return b1.compareTo(b2) == 0;
	}

	public static boolean le(BigDecimal b1, BigDecimal b2) {
		if (b1 == null || b2 == null) return false;
		return b1.compareTo(b2) <= 0;
	}

	public static boolean lt(BigDecimal b1, BigDecimal b2) {
		if (b1 == null || b2 == null) return false;
		return b1.compareTo(b2) < 0;
	}

	public static void rejectIfLess(BindingResult errors, String field, String value, int min) {
		if (value != null && value.length() >= min)
			return;
		errors.rejectValue(field, null, "At least " + min + " characters");
	}


	private static boolean hasNameAndDomain(String aEmailAddress) {
		String[] tokens = aEmailAddress.split("@");
		return tokens.length == 2 && StringUtils.hasText(tokens[0]) && StringUtils.hasText(tokens[1]);
	}

	public static long notNull(Long id) {
		if (id == null) return 0L;
		else return id.longValue();
	}
	
	public static double notNull(Double id) {
		if (id == null) return 0;
		else return id.doubleValue();
	}
	
	/**
	 * convert the given entity list to json dto array in a GridRes object. 
	 * @param req
	 * @param list
	 * @param resClass
	 * @param dataClass
	 * @param mapper
	 * @return
	 */
	public static <E,D, RS extends GridRes<D>, RQ extends GridReq<E>> RS convertToData(RQ req, List<E> list,
                                                                                       Class<RS> resClass, Class<D> dataClass, ModelMapper mapper) {
		RS res;
		try {
			res = resClass.newInstance();
		} catch (Exception e) { throw new RuntimeException(e); }
		res.setTotal(req.getTotalPages());
		res.setPage(req.getPage());
		res.setRecords(req.getRecords());
		
		@SuppressWarnings("unchecked")
		D[] data = (D[]) Array.newInstance(dataClass, list.size());
		int i = 0;
		for(E c : list) {
			data[i] = mapper.map(c, dataClass);
			i++;
		}
		
		res.setRows(data);
		
		return res;
	}
	
	/**
	 * GridReq 없이 grid 결과 생성.
	 * 항상 페이지는 1
	 * 레코드 갯수는 list.size() 
	 * @param list
	 * @param resClass
	 * @param dataClass
	 * @param mapper
	 * @return
	 */
	public static <E,D, RS extends GridRes<D>> RS convertToData(List<E> list, Class<RS> resClass, Class<D> dataClass, ModelMapper mapper) {
		RS res;
		try {
			res = resClass.newInstance();
		} catch (Exception e) { throw new RuntimeException(e); }
		res.setPage(1);
		res.setRecords(list.size());
		
		@SuppressWarnings("unchecked")
		D[] data = (D[]) Array.newInstance(dataClass, list.size());
		int i = 0;
		
		for(E c : list) {
			data[i] = mapper.map(c, dataClass);
			i++;
		}
		
		res.setRows(data);
		
		return res;
	}
	
	@SuppressWarnings("unchecked")
	public static <T, D> D[] convertToData(Collection<T> list, Class<? extends D> dClass, ModelMapper mapper) {
		D[] data = (D[])Array.newInstance(dClass, list.size());
		int idx = 0;
		try {
			for(T entity : list) {
				data[idx] = (D) dClass.newInstance();
				mapper.map(entity, data[idx]);
				idx++;
			}
			
			return data;
		} catch (InstantiationException | IllegalAccessException e) {
			throw new RuntimeException(e);
		}
	}

	public static BigDecimal add(BigDecimal base, BigDecimal add) {
		if (add == null) return base;
		return base.add(add);
	}

	public static int intVal(BigDecimal dec) {
		return dec == null ? 0 : dec.intValue();
	}
	
	public static int intVal(Long val) {
		return val == null ? 0 : val.intValue();
	}
	
	public static int intVal(Integer val) {
		return val == null ? 0 : val.intValue();
	}
	
	public static String comma(int val) {
		return String.format("%,d", val);
	}
	
	public static String comma(BigDecimal val) {
		return String.format("%,.2f", val);
	}
	
	public static String comma0(BigDecimal val) {
		return String.format("%,.0f", val);
	}
	
	public static void main(String[] args) {
	}

	public static int parseInt(String str) {
		if (!isNumberOnly(str)) return INVALID_NUMBER;
		return Integer.parseInt(str);
	}

	public static BigDecimal multiply(BigDecimal a, int b) {
		if (a == null) return null;
		return a.multiply(BigDecimal.valueOf(b));
	}
	
	public static BigDecimal divide(BigDecimal numer, int denom) {
		if (denom == 0) return null;
		return numer.multiply(BigDecimal.valueOf(denom));
	}
	
	public static BigDecimal divide(BigDecimal numer, BigDecimal denom, int scale) {
		if (denom == null || Utils.isZero(denom)) return null;
		return numer.divide(denom, scale, BigDecimal.ROUND_HALF_UP);
	}

	public static int divideToIntF(BigDecimal numer, BigDecimal denom) {
		if (numer == null || denom == null || Utils.isZero(denom)) return 0;
		return numer.divide(denom, 0, BigDecimal.ROUND_FLOOR).intValue();
				
	}

	public static BigDecimal multiply(BigDecimal a, BigDecimal b) {
		if (a == null || b == null) return null;
		return a.multiply(b);
	}

	public static BigDecimal max(BigDecimal a, BigDecimal b) {
		if (a == null || b == null) return null;
		if (Utils.gt(a, b)) return a;
		else return b;
	}

	/**
	 * Array['a','b','c'] -> 'a','b','c'
	 * @param seperator
	 * @param wrapper
	 * @param parts
	 * @return
	 */
	public static String wrapJoin(String seperator, String wrapper, Object[] parts) {
		return wrapper + Joiner.on(wrapper + seperator + wrapper).join(parts) + wrapper;
	}

    public static void rejectIfBelowZero(BigDecimal val, String name, BindingResult errors) {
		if (val == null) errors.rejectValue(name, null, "필수항목입니다");
		else if (Utils.lt(val, BigDecimal.ZERO))
			errors.rejectValue(name, null, "허용되는 값이 아닙니다");
    }
}
