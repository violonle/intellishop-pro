package com.shoppro.service.export.impl;

import com.shoppro.service.export.DataExportService;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class DataExportServiceImpl implements DataExportService {

    private static final Logger log = LoggerFactory.getLogger(DataExportServiceImpl.class);
    private static final SimpleDateFormat DATE_FORMAT = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

    @Override
    public byte[] exportToExcel(List<Map<String, Object>> data, String[] headers, String[] fields, String sheetName) {
        log.info("导出Excel: {} 条数据, sheet={}", data.size(), sheetName);

        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet(sheetName != null ? sheetName : "数据");

            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dateStyle = workbook.createCellStyle();
            CreationHelper createHelper = workbook.getCreationHelper();
            dateStyle.setDataFormat(createHelper.createDataFormat().getFormat("yyyy-mm-dd hh:mm:ss"));

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 20 * 256);
            }

            for (int i = 0; i < data.size(); i++) {
                Row row = sheet.createRow(i + 1);
                Map<String, Object> rowData = data.get(i);

                for (int j = 0; j < fields.length; j++) {
                    Cell cell = row.createCell(j);
                    Object value = rowData.get(fields[j]);
                    setCellValue(cell, value, dateStyle);
                }
            }

            workbook.write(out);
            log.info("Excel导出完成: {} 字节", out.size());
            return out.toByteArray();

        } catch (IOException e) {
            log.error("Excel导出失败", e);
            throw new RuntimeException("Excel导出失败: " + e.getMessage());
        }
    }

    @Override
    public byte[] exportToCsv(List<Map<String, Object>> data, String[] headers, String[] fields) {
        log.info("导出CSV: {} 条数据", data.size());

        StringBuilder sb = new StringBuilder();
        sb.append(String.join(",", headers)).append("\n");

        for (Map<String, Object> row : data) {
            List<String> values = new ArrayList<>();
            for (String field : fields) {
                Object value = row.get(field);
                values.add(formatCsvValue(value));
            }
            sb.append(String.join(",", values)).append("\n");
        }

        log.info("CSV导出完成: {} 字节", sb.length());
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    @Override
    public List<Map<String, Object>> parseExcel(byte[] content, String[] fields, int startRow) {
        log.info("解析Excel: {} 字节, 字段数={}, 起始行={}", content.length, fields.length, startRow);
        List<Map<String, Object>> result = new ArrayList<>();

        try (Workbook workbook = WorkbookFactory.create(new ByteArrayInputStream(content))) {
            Sheet sheet = workbook.getSheetAt(0);

            for (int i = startRow; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                Map<String, Object> rowData = new LinkedHashMap<>();
                boolean hasData = false;

                for (int j = 0; j < fields.length; j++) {
                    Cell cell = row.getCell(j);
                    Object value = getCellValue(cell);
                    rowData.put(fields[j], value);
                    if (value != null && !value.toString().trim().isEmpty()) {
                        hasData = true;
                    }
                }

                if (hasData) {
                    result.add(rowData);
                }
            }

            log.info("Excel解析完成: {} 条数据", result.size());
            return result;

        } catch (IOException e) {
            log.error("Excel解析失败", e);
            throw new RuntimeException("Excel解析失败: " + e.getMessage());
        }
    }

    @Override
    public List<Map<String, Object>> parseCsv(String content, String[] fields) {
        log.info("解析CSV: {} 字节, 字段数={}", content.length(), fields.length);
        List<Map<String, Object>> result = new ArrayList<>();

        String[] lines = content.split("\n");
        for (int i = 1; i < lines.length; i++) {
            String line = lines[i].trim();
            if (line.isEmpty()) continue;

            String[] values = parseCsvLine(line);
            Map<String, Object> rowData = new LinkedHashMap<>();

            for (int j = 0; j < fields.length && j < values.length; j++) {
                rowData.put(fields[j], values[j].trim());
            }

            if (!rowData.isEmpty()) {
                result.add(rowData);
            }
        }

        log.info("CSV解析完成: {} 条数据", result.size());
        return result;
    }

    @Override
    public String generateTemplate(String[] headers, String[] fields, String format) {
        log.info("生成导入模板: 格式={}, 字段数={}", format, fields.length);

        if ("csv".equalsIgnoreCase(format)) {
            StringBuilder sb = new StringBuilder();
            sb.append(String.join(",", headers)).append("\n");
            sb.append(String.join(",", Collections.nCopies(fields.length, ""))).append("\n");
            return sb.toString();
        }

        return "";
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setAlignment(HorizontalAlignment.CENTER);

        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);

        return style;
    }

    private void setCellValue(Cell cell, Object value, CellStyle dateStyle) {
        if (value == null) {
            cell.setCellValue("");
        } else if (value instanceof Number) {
            cell.setCellValue(((Number) value).doubleValue());
        } else if (value instanceof Date) {
            cell.setCellValue((Date) value);
            cell.setCellStyle(dateStyle);
        } else if (value instanceof Boolean) {
            cell.setCellValue((Boolean) value);
        } else {
            cell.setCellValue(value.toString());
        }
    }

    private Object getCellValue(Cell cell) {
        if (cell == null) return null;

        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue();
                }
                return cell.getNumericCellValue();
            case BOOLEAN:
                return cell.getBooleanCellValue();
            case FORMULA:
                return cell.getCellFormula();
            default:
                return null;
        }
    }

    private String formatCsvValue(Object value) {
        if (value == null) return "";
        String str = value.toString();
        if (str.contains(",") || str.contains("\"") || str.contains("\n")) {
            return "\"" + str.replace("\"", "\"\"") + "\"";
        }
        return str;
    }

    private String[] parseCsvLine(String line) {
        List<String> result = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;

        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);

            if (c == '"') {
                if (inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '"') {
                    current.append('"');
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (c == ',' && !inQuotes) {
                result.add(current.toString());
                current = new StringBuilder();
            } else {
                current.append(c);
            }
        }
        result.add(current.toString());

        return result.toArray(new String[0]);
    }
}
