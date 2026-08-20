package com.shoppro.service.export;

import java.util.List;
import java.util.Map;

public interface DataExportService {

    byte[] exportToExcel(List<Map<String, Object>> data, String[] headers, String[] fields, String sheetName);

    byte[] exportToCsv(List<Map<String, Object>> data, String[] headers, String[] fields);

    List<Map<String, Object>> parseExcel(byte[] content, String[] fields, int startRow);

    List<Map<String, Object>> parseCsv(String content, String[] fields);

    String generateTemplate(String[] headers, String[] fields, String format);
}
