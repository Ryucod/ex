package com.core.epril.grid;

/**
 * Grid의 footer에 적용할 userdata가 추가된 grid response
 * @author T
 *
 * @param <T>
 * @param <U>
 */
public class GridResWithUserdata<T, U> extends GridRes<T> {
	private U userdata;
	
	public U getUserdata() {
		return userdata;
	}

	public void setUserdata(U userdata) {
		this.userdata = userdata;
	}
} 