package com.ekayworks.ex.support.utils;

import lombok.extern.slf4j.Slf4j;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.math.BigInteger;
import java.nio.channels.FileChannel;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
public abstract class FileUtils {

    public static final Pattern DENIED_FILENAME_PATTERN = Pattern.compile("[%$;:~`]");


    /**
     * 생성자 (생성금지)
     */
    private FileUtils(){}

    /**
     * 확장자
     * @param filename 파일이름
     * @return 확장자
     */
    public static String getFileExtension(String filename) {
        return getFilenameAndExtension(filename)[1];
    }

    /**
     * 확장자
     * @param file 파일객체
     * @return 확장자
     */
    public static String getFileExtension(File file) {
        return getFileExtension(file.getName());
    }

    /**
     * 확장자
     * @param file 파일객체
     * @return 확장자
     */
    public static String getFileExtension(MultipartFile file) {
        return getFileExtension(file.getOriginalFilename());
    }

    public static String getThumbUrlPath(String originalUrlPath) {
        int pos = originalUrlPath.lastIndexOf("/");
        String path = "";
        String file = "";
        if (pos > 0) {
            path = originalUrlPath.substring(0, pos);
            file = originalUrlPath.substring(pos);
        }
        String[] filename = getFilenameAndExtension(file);
        return path + filename[0] ;//+ WebContext.UPLOADED_IMAGE_THUMB_POSTFIX + "." + filename[1];
    }

    /**
     * 유일한 파일이름 구하기 (공백치환 겸용)
     * @param file 파일객체
     * @return 유일한 이름으로 변환된 File 객체
     */
    public static File getUniqueFile(File file) {
        if (!file.exists()) {
            return file;
        }
        File result = file;
        File parent = result.getParentFile();

        String regex = "_(\\d+)_$";
        Pattern pattern = Pattern.compile(regex);

        while (result.exists()) {
            String filename = result.getName().replaceAll(" ", "_"); //공백을 _로 치환
            String[] filenames = getFilenameAndExtension(filename);

            Matcher m = pattern.matcher(filenames[0]);

            if (file.isDirectory()) { // 그 디렉토리가 있어!!
                throw new RuntimeException("디렉토리가 존재함");
            } else if (file.isFile() && m.find()) {
                String numString = m.group(1);
                int num = Integer.parseInt(numString) + 1;
                filename = m.replaceFirst("_" + Integer.toString(num))+ "_" + (filenames[1].equals("")?"":"."+filenames[1]);
                result = new File(parent, filename);
            } else {
                result = new File(parent, filenames[0] + "_1_" + (filenames[1].equals("")?"":"."+filenames[1]));
            }
        }

        return result;
    }

    /**
     * 파일명, 확장자 분리
     * @param filename 파일이름
     * @return 파일이름, 확장자 배열
     */
    public static String[] getFilenameAndExtension(String filename) {
        String[] temp = new String[2];
        int index = filename.lastIndexOf(".");
        if (index == -1) {
            temp[0] = filename;
            temp[1] = "";
        } else {
            temp[0] = filename.substring(0, index);
            temp[1] = filename.substring(index + 1);
        }
        return temp;
    }


    /**
     * IE 의 경우 originalFilename 에 경로까지 전송함. 경로 제거
     *
     * @param originalFilename
     * @return
     */
    public static String removeDirFromOriginalFilename(String originalFilename) {
        String fileName = originalFilename;
        if (fileName.lastIndexOf("\\") != -1) {
            fileName = fileName.substring(originalFilename.lastIndexOf("\\") + 1);
        }
        return fileName;
    }

    public static String formatFileSize(long bytes) {
        if (bytes >= Math.pow(1024,3)) {
            return String.format("%,d GB", (long)(bytes / Math.pow(1024,3)));
        }
        if (bytes >= Math.pow(1024,2)) {
            return String.format("%,d MB", (long)(bytes / Math.pow(1024,2)));
        }
        return String.format("%,d KB", (long)(bytes / 1024));
    }

    public static boolean checkInvalidFilenamePattern(String filename) {
        return DENIED_FILENAME_PATTERN.matcher(filename).find();
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

    public static String makeHash(String string) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            digest.reset();
            digest.update(string.getBytes("utf8"));
            return String.format("%064x", new BigInteger(1, digest.digest()));
        } catch (Exception e) {
            log.error("해시코드 생성 오류", e);
            throw new RuntimeException("해시코드 생성 오류", e);
        }
    }

    public static void copyFile(String rootPath, String storedPath, String storedFileName, Path uniqueFilePath) {
        try {
            RandomAccessFile file = new RandomAccessFile(rootPath + File.separator + storedPath + File.separator + storedFileName, "r");
            RandomAccessFile newFile = new RandomAccessFile(uniqueFilePath.toString(), "rw");
            FileChannel source = file.getChannel();
            FileChannel target = newFile.getChannel();
            source.transferTo(0, source.size(), target);
        } catch (Exception e) {
            log.error("파일복사 오류", e);
            e.printStackTrace();
        }
    }

    /*public static Long resizeFile(MultipartFile multipartFile, Path baseFilePath, Path targetFilePath) throws IOException {
        BufferedImage orig = ImageIO.read(multipartFile.getInputStream());
        BufferedImage outputImage = Scalr.resize(orig, Scalr.Method.SPEED, Scalr.Mode.FIT_EXACT, Scalr.THRESHOLD_QUALITY_BALANCED);
        Files.createDirectories(baseFilePath);
//        log.info("targetFilePath::{}", targetFilePath.toString());
        String extension = getExtension(multipartFile.getOriginalFilename());
        File toFile = targetFilePath.toFile();
        ImageIO.write(outputImage, Objects.requireNonNull(extension), toFile);
        log.debug("파일저장 완료:{}", targetFilePath);
        return toFile.length();
    }*/


}
