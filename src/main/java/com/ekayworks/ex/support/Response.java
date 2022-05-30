package com.ekayworks.ex.support;

import lombok.Data;

@Data
public class Response<T> {
    /**
     * 상태코드
     */
    int status;

    /**
     * 에러메시지
     */
    String error;

    /**
     * 응답 데이터
     */
    T data;

    public static int OK = 0;
    public static int INVALID = 501; // 세션 없을 때
    public static int UNKNOWN = 999;

    public Response() {

    }

    public static <T> Response<T> ok(T data) {
        Response<T> res = new Response<>();
        res.setStatus(OK);
        res.setData(data);
        return res;
    }

    public static <T> Response<T> ok(T data, String msg) {
        Response<T> res = new Response<>();
        res.setStatus(OK);
        res.setData(data);
        res.setError(msg);
        return res;
    }

    public static <T> Response<T> unknown(String msg) {
        Response<T> res = new Response<>();
        res.setStatus(UNKNOWN);
        res.setData(null);
        res.setError(msg);
        return res;
    }

    public Response(int status, String error, T data) {
        this.status = status;
        this.error = error;
        this.data = data;
    }
}
