package com.ekayworks.ex.support.utils;

import lombok.extern.slf4j.Slf4j;
import org.apache.catalina.connector.ClientAbortException;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.text.StringEscapeUtils;
import org.springframework.http.HttpStatus;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.net.URLEncoder;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.stream.Collectors;

/**
 *  HTTP 유틸
 *
 *  @version 1.0
 *  @author realgurus 이호
 *  @since 2017.02.01
*/
@Slf4j
public class HttpUtils {
	private static final int BUF_SIZE =  2 * 1024;
	public static final int EOF = -1;

    /**
     * 생성자
     */
    private HttpUtils() {}
    
    /**
     * IP 구하기
     * @param request HttpRequest
     * @return IP
     */
    public static String getRemoteAddr(HttpServletRequest request) {

        String ip = request.getHeader("Proxy-Client-IP"); //for weblogic plugin
        
        if (StringUtils.isEmpty(ip) || ip.equalsIgnoreCase("unknown")) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR"); //for iis arr
        }
        if (StringUtils.isEmpty(ip) || ip.equalsIgnoreCase("unknown")) {
            ip = request.getHeader("X-Forwarded-For"); //for iis arr
        }
        if (StringUtils.isEmpty(ip) || ip.equalsIgnoreCase("unknown")) {
            ip = request.getHeader("REMOTE_ADDR");
        }
        if (StringUtils.isEmpty(ip) || ip.equalsIgnoreCase("unknown")) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }
    
	/**
	 * IP 구하기
	 * RequestContextHolder 를 사용하여 인자없이 구하기
	 * @return
	 */
	public static String getRemoteAddr() {
		return getRemoteAddr(getRequest());
	}
	    
	
	/**
	 * HttpServletRequest 구하기
	 * @return
	 */
	public static HttpServletRequest getRequest() throws IllegalStateException {
		return ((ServletRequestAttributes)RequestContextHolder.currentRequestAttributes()).getRequest();
	}
	
	/**
	 * 모바일 브라우저 여부
	 * @return
	 */
	public static boolean isMobile(HttpServletRequest request) {
		String userAgent = request.getHeader("user-agent");
		boolean mobile1 = userAgent.matches(".*(iPhone|iPod|Android|Windows CE|BlackBerry|Symbian|Windows Phone|webOS|Opera Mini|Opera Mobi|POLARIS|IEMobile|lgtelecom|nokia|SonyEricsson).*");
		boolean mobile2 = userAgent.matches(".*(LG|SAMSUNG|Samsung).*");
		if (mobile1 || mobile2) {
			return true;
		}
		return false;
	}
	
	/**
	 * 줄변환까지 적용한 html escape 분자열
	 * @param text
	 * @return
	 */
	public static String getEscapedContent(String text) {
		text = StringEscapeUtils.escapeHtml4(text);
		text = text.replaceAll("\r", "<br/>");
		return text;
	}
	
	public static String getMaxLines(String text, int max) {
		return Arrays.stream(text.split("\n")).map(String::trim).filter(l->l.length()>0).limit(max).collect(Collectors.joining("\n"));
	}
	
	public static String unescapeHtml(String content) {
		String text = content.replaceAll("<[^>]*>","");
		text = text.replaceAll("&nbsp;", " ");// 이상하게 &nbsp; 가 안먹음..
		text = StringEscapeUtils.unescapeHtml4(text);
		//빈줄제거 및 crlf 정규화
		text = Arrays.stream(text.split("\r")).map(String::trim).filter(l->l.length()>0).collect(Collectors.joining("\n"));
		return text;
	}
	
	public static String markKeyword(String title, String keyword) {
		title = StringEscapeUtils.escapeHtml4(title);
		title = title.replaceAll(keyword, "<span class=\"keyword\">" + keyword + "</span>");
		return title;
	}

	/**
	 * 현재시간이 기간 내에 존재하는지 체크
	 * @param startDate
	 * @param stopDate
	 * @return
	 */
	public static boolean isOccupiedDate(LocalDateTime startDate, LocalDateTime stopDate){
		return LocalDateTime.now().isAfter(startDate) && LocalDateTime.now().isBefore( stopDate);
	}

	public static int fileDownload(String rootPath, String filePath, String fileName, OutputStream out) {
		InputStream in = null;
		byte[] bytes = null;
		File file = null;
		int byteCount = -1;
		try {
			file = new File(rootPath + filePath + File.separator, fileName);

			in = new FileInputStream(file);
			byteCount = FileCopyUtils.copy(in, out);
		} catch (Exception e) {
			throw new RuntimeException("File Download Error.", e);
		}
		return byteCount;
	}

	public static void streamingDownload(String rootPath, String filePath, String fileName, String  mimeType, String fileOriginalName, OutputStream out, HttpServletRequest request, HttpServletResponse response) {
		long rangeStart = 0L; //범위 시작
		long rangeEnd = 0L; //범위 끝
		RandomAccessFile randomFile = null;
		String browser = getBrowser(request);
		File file = null;

		try {
			file = new File(rootPath + filePath + File.separator, fileName);
			randomFile = new RandomAccessFile(file, "r");
			//media file size
			long mediaSize = randomFile.length();

			//request strema range
			String range = request.getHeader("range");
			log.debug("curRange : {}", range);

			range = range + (mediaSize - 1);
			int idxeq = range.trim().indexOf("=");
			int idxm = range.trim().indexOf("-");

			rangeStart = Long.parseLong(range.substring(idxeq + 1, idxm));
			if (idxm > range.length() -1) {
				rangeEnd = Long.parseLong(range.substring(idxm + 1));
			}
			if (rangeEnd == 0) {
				rangeEnd = rangeStart + 2048 * 1024 - 1; //데이터가 없을경우 내려보내는 데이터 크기를 1메가로 설정
				//rangeEnd = mediaSize - 1;
			}

			if ( rangeEnd > mediaSize -1) {
				rangeEnd = mediaSize - 1;
			}

			long partSize = rangeEnd - rangeStart + 1; //시작과 끝위치를 포함하는 데이터 크기
			log.debug("range info ={}", rangeStart + "-" +rangeEnd + "/" + partSize);

			//send data
			response.reset();
			response.setStatus(HttpStatus.PARTIAL_CONTENT.value());
			String contentRange = rangeStart + "-" + rangeEnd + "/" + mediaSize;

			//set header
			setHeaders(fileOriginalName, browser, contentRange, String.valueOf(partSize), mimeType, response);
			//set media file start index
			randomFile.seek(rangeStart);


			byte[] buf = new byte[BUF_SIZE];
			//long block = partSize > BUF_SIZE ? BUF_SIZE :  partSize;
			int len = 0;
			while ((rangeStart < rangeEnd) && (EOF != (len = randomFile.read(buf)))) {
				out.write(buf, 0 , len);
				out.flush();
				rangeStart += BUF_SIZE;
			}

			log.debug("send : {}", fileName + " : rangeStart=" + rangeStart + ", rangeEnd=" + rangeEnd);
		} catch (ClientAbortException e) {
			log.debug("ClientAbort.. cancel Sending..");
		}  catch (Exception e) {
			log.debug("File Streaming Download Exception..");
		} finally {
			if (randomFile != null) {
				try {
					randomFile.close();
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		}
	}

	public static void setHeaders(String fileName, String browserHeader, String contentRange, String contentLength, String mimeType, HttpServletResponse response) throws Exception {
		String encodedFilename = encodedFileName(browserHeader, fileName);

		response.setHeader("Content-Range", "bytes " + contentRange);
		response.setHeader("Accept-Ranges", "bytes");
		response.setHeader("Content-Disposition", "attachment;filename=\"" + encodedFilename + "\";");
		response.setHeader("Content-Length", contentLength);
		response.setHeader("Content-Type", mimeType);
		response.setHeader("Content-Transfer-Encoding", "binary");
	}

	public static void setHeaders(String fileName, long fileSize, String mimeType, String browserHeader, HttpServletResponse response) {
		try {
			String encodedFilename = encodedFileName(browserHeader, fileName);

			// headers.setContentType(MediaType.valueOf("application/vnd.android.package-archive
			// apk"));
			response.setHeader("Content-Disposition", "attachment;filename=\"" + encodedFilename + "\";");
			response.setHeader("Content-Length", String.valueOf(fileSize));
			response.setHeader("Content-Type", mimeType);
			response.setHeader("Content-Transfer-Encoding", "binary");
		} catch (Exception e) {
			throw new RuntimeException("Set Header error : ", e);
		}
	}
	public static String encodedFileName(String browserHeader, String fileName) throws Exception {
		String encodedFilename = "";

		if (browserHeader.contains("MSIE")) {
			encodedFilename = URLEncoder.encode(fileName, "UTF-8").replace("+", "%20");

		} else if (browserHeader.contains("Firefox")) {
			encodedFilename = new String(fileName.getBytes("UTF-8"), "ISO-8859-1");

		} else if (browserHeader.contains("Opera")) {
			encodedFilename = new String(fileName.getBytes("UTF-8"), "ISO-8859-1");

		} else if (browserHeader.contains("Chrome")) {
			encodedFilename = new String(fileName.getBytes("UTF-8"), "ISO-8859-1");
		}
		return encodedFilename;
	}

	public static String getBrowser(HttpServletRequest request) {
		String header = request.getHeader("User-Agent");
		if (header.contains("MSIE")) {
			return "MSIE";
		} else if (header.contains("Chrome")) {
			return "Chrome";
		} else if (header.contains("Opera")) {
			return "Opera";
		}
		return "Firefox";
	}
}
