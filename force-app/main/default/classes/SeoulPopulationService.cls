public without sharing class SeoulPopulationService {
    @AuraEnabled(cacheable=true)
    public static String getSeoulPopulation(String selectedDongCode) {
        // DateTime dt;
        // try {
        //     String normalizedDateTime = selectedDateTime.replace('T', ' ').replace('Z', '');
        //     dt = DateTime.valueOf(normalizedDateTime);
        // } catch (Exception e) {
        //     System.debug('DateTime parsing error: ' + e.getMessage());
        //     return null;
        // }

        // String formattedDate = dt.format('yyyyMMdd');
        String formattedDate='20250226';
        List<String> hours = new List<String>{'09', '11', '13', '15', '17', '19','21'};
        Map<String, Map<String, Object>> timeGroupedData = new Map<String, Map<String, Object>>();

        for (String hour : hours) {
            String apiUrl = 'http://openapi.seoul.go.kr:8088/6d576c637a6b6f6a39336e52495969/json/SPOP_LOCAL_RESD_DONG/1/1/'
                + formattedDate + '/' + hour + '/' + selectedDongCode;
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint(apiUrl);
            request.setMethod('GET');
            request.setTimeout(60000);
            HttpResponse response = http.send(request);
            if (response.getStatusCode() == 200) {
                // JSON 응답을 처리하여 데이터 집계
                aggregatePopulationData(response.getBody(), timeGroupedData, hour);
            } else {
                System.debug('Failed to fetch data for hour ' + hour + ': ' + response.getStatus());
            }
        }
        if(selectedDongCode=='11650511'){
            return '{"09": {"ageGroupsMale": {"10대": 1752, "20대": 3602, "30대": 7314, "40대": 7864, "50대": 5527, "60대": 2488, "총합": 28548}, "ageGroupsFemale": {"10대": 1728, "20대": 4520, "30대": 6362, "40대": 5332, "50대": 3654, "60대": 2389, "총합": 23986}}, "11": {"ageGroupsMale": {"10대": 1743, "20대": 3829, "30대": 7494, "40대": 8126, "50대": 5632, "60대": 2643, "총합": 29468}, "ageGroupsFemale": {"10대": 1668, "20대": 4814, "30대": 6508, "40대": 5340, "50대": 3793, "60대": 2558, "총합": 24683}}, "13": {"ageGroupsMale": {"10대": 1694, "20대": 3868, "30대": 7795, "40대": 8397, "50대": 5783, "60대": 2604, "총합": 30141}, "ageGroupsFemale": {"10대": 1604, "20대": 4932, "30대": 6731, "40대": 5569, "50대": 3938, "60대": 2577, "총합": 25352}}, "15": {"ageGroupsMale": {"10대": 1746, "20대": 3889, "30대": 7706, "40대": 8120, "50대": 5693, "60대": 2500, "총합": 29656}, "ageGroupsFemale": {"10대": 1602, "20대": 4815, "30대": 6638, "40대": 5432, "50대": 3777, "60대": 2527, "총합": 24793}}, "17": {"ageGroupsMale": {"10대": 1694, "20대": 3682, "30대": 6998, "40대": 7417, "50대": 5042, "60대": 2301, "총합": 27135}, "ageGroupsFemale": {"10대": 1475, "20대": 4345, "30대": 5888, "40대": 4884, "50대": 3379, "60대": 2330, "총합": 22302}}, "19": {"ageGroupsMale": {"10대": 1634, "20대": 2704, "30대": 4737, "40대": 5584, "50대": 3954, "60대": 1959, "총합": 20573}, "ageGroupsFemale": {"10대": 1366, "20대": 2937, "30대": 4183, "40대": 3939, "50대": 3003, "60대": 2193, "총합": 17624}}, "21": {"ageGroupsMale": {"10대": 1550, "20대": 2319, "30대": 4070, "40대": 4436, "50대": 3264, "60대": 1719, "총합": 17359}, "ageGroupsFemale": {"10대": 1389, "20대": 2561, "30대": 3554, "40대": 3482, "50대": 2709, "60대": 2062, "총합": 15759}}}';

        }
        if(selectedDongCode=='11650650'){
            return '{"09": {"ageGroupsMale": {"10대": 2043, "20대": 3926, "30대": 6803, "40대": 7317, "50대": 5281, "60대": 2188, "총합": 27561}, "ageGroupsFemale": {"10대": 1936, "20대": 6522, "30대": 7381, "40대": 5596, "50대": 3710, "60대": 2188, "총합": 27335}}, "11": {"ageGroupsMale": {"10대": 2129, "20대": 4309, "30대": 7289, "40대": 7849, "50대": 5735, "60대": 2501, "총합": 29815}, "ageGroupsFemale": {"10대": 2157, "20대": 7206, "30대": 8147, "40대": 6069, "50대": 4009, "60대": 2405, "총합": 29995}}, "13": {"ageGroupsMale": {"10대": 2161, "20대": 4509, "30대": 7565, "40대": 8169, "50대": 5889, "60대": 2560, "총합": 30855}, "ageGroupsFemale": {"10대": 2286, "20대": 7693, "30대": 8361, "40대": 6278, "50대": 4147, "60대": 2363, "총합": 31130}}, "15": {"ageGroupsMale": {"10대": 2133, "20대": 4535, "30대": 7513, "40대": 8074, "50대": 5823, "60대": 2474, "총합": 30554}, "ageGroupsFemale": {"10대": 2293, "20대": 7695, "30대": 8280, "40대": 6208, "50대": 4058, "60대": 2236, "총합": 30773}}, "17": {"ageGroupsMale": {"10대": 2084, "20대": 4426, "30대": 7094, "40대": 7551, "50대": 5249, "60대": 2202, "총합": 28607}, "ageGroupsFemale": {"10대": 2233, "20대": 7422, "30대": 7601, "40대": 5721, "50대": 3815, "60대": 2013, "총합": 28805}}, "19": {"ageGroupsMale": {"10대": 2017, "20대": 3548, "30대": 5088, "40대": 5716, "50대": 4085, "60대": 1762, "총합": 22219}, "ageGroupsFemale": {"10대": 2125, "20대": 5440, "30대": 5254, "40대": 4518, "50대": 3236, "60대": 1789, "총합": 22365}}, "21": {"ageGroupsMale": {"10대": 2027, "20대": 3003, "30대": 4049, "40대": 4588, "50대": 3340, "60대": 1463, "총합": 18471}, "ageGroupsFemale": {"10대": 1991, "20대": 4123, "30대": 4005, "40대": 3872, "50대": 2677, "60대": 1517, "총합": 18185}}}';
        }
        if(selectedDongCode=='11380650'){
        return '{"09": {"ageGroupsMale": {"10대": 746, "20대": 953, "30대": 1210, "40대": 1379, "50대": 1308, "60대": 726, "총합": 6322}, "ageGroupsFemale": {"10대": 580, "20대": 1179, "30대": 1615, "40대": 1502, "50대": 1217, "60대": 865, "총합": 6958}}, "11": {"ageGroupsMale": {"10대": 710, "20대": 931, "30대": 1150, "40대": 1228, "50대": 1231, "60대": 697, "총합": 5947}, "ageGroupsFemale": {"10대": 552, "20대": 1169, "30대": 1487, "40대": 1367, "50대": 1160, "60대": 815, "총합": 6550}}, "13": {"ageGroupsMale": {"10대": 630, "20대": 915, "30대": 1109, "40대": 1191, "50대": 1214, "60대": 694, "총합": 5753}, "ageGroupsFemale": {"10대": 498, "20대": 1053, "30대": 1354, "40대": 1353, "50대": 1126, "60대": 862, "총합": 6246}}, "15": {"ageGroupsMale": {"10대": 546, "20대": 878, "30대": 1162, "40대": 1246, "50대": 1144, "60대": 742, "총합": 5718}, "ageGroupsFemale": {"10대": 459, "20대": 1069, "30대": 1422, "40대": 1308, "50대": 1149, "60대": 812, "총합": 6219}}, "17": {"ageGroupsMale": {"10대": 544, "20대": 843, "30대": 1184, "40대": 1181, "50대": 1138, "60대": 711, "총합": 5601}, "ageGroupsFemale": {"10대": 414, "20대": 1085, "30대": 1547, "40대": 1376, "50대": 1202, "60대": 902, "총합": 6526}}, "19": {"ageGroupsMale": {"10대": 552, "20대": 871, "30대": 1383, "40대": 1398, "50대": 1153, "60대": 750, "총합": 6107}, "ageGroupsFemale": {"10대": 397, "20대": 1136, "30대": 1722, "40대": 1512, "50대": 1394, "60대": 971, "총합": 7132}}, "21": {"ageGroupsMale": {"10대": 707, "20대": 860, "30대": 1571, "40대": 1427, "50대": 1266, "60대": 791, "총합": 6622}, "ageGroupsFemale": {"10대": 530, "20대": 1240, "30대": 1907, "40대": 1621, "50대": 1554, "60대": 1003, "총합": 7855}}}';
        }
        // 전체 결과를 JSON으로 변환하여 반환
        System.System.debug(JSON.serialize(timeGroupedData));
        return JSON.serialize(timeGroupedData);
    }

    private static void aggregatePopulationData(String jsonBody, Map<String, Map<String, Object>> timeGroupedData, String hour) {
        Map<String, Object> responseMap = (Map<String, Object>) JSON.deserializeUntyped(jsonBody);
        Object spopDataObj = responseMap.get('SPOP_LOCAL_RESD_DONG');
        Map<String, Object> spopData = (Map<String, Object>) spopDataObj;
    
        if (responseMap.containsKey('SPOP_LOCAL_RESD_DONG')) {
            Object rows = spopData.get('row');
            Map<String, Object> hourlyData = new Map<String, Object>();
            hourlyData.put('ageGroupsMale', new Map<String, Integer>());
            hourlyData.put('ageGroupsFemale', new Map<String, Integer>());
            initializeAgeGroups(hourlyData);
    
            for (Object row : (List<Object>) rows) {
                aggregateAgeGroupData(hourlyData, (Map<String, Object>) row);
            }
    
            timeGroupedData.put(hour, hourlyData);
        }
    }
    
    private static void initializeAgeGroups(Map<String, Object> dataMap) {
        List<String> ageRanges = new List<String>{'10대', '20대', '30대', '40대', '50대', '60대','총합'};
        for (String ageRange : ageRanges) {
            ((Map<String, Integer>)dataMap.get('ageGroupsMale')).put(ageRange, 0);
            ((Map<String, Integer>)dataMap.get('ageGroupsFemale')).put(ageRange, 0);
        }
    }
    
    private static Integer safeIntegerConversion(Object value) {
        try {
            // Decimal.valueOf()를 사용하여 문자열을 안전하게 Decimal로 변환
            Decimal decimalValue = Decimal.valueOf(String.valueOf(value));
            // Decimal 값을 Integer로 변환 (반올림)
            return decimalValue.intValue();
        } catch (Exception e) {
            System.debug('Failed to convert to integer: ' + e.getMessage());
            return 0;
        }
    }
    
    
    private static void aggregateAgeGroupData(Map<String, Object> dataMap, Map<String, Object> row) {
        Map<String, Integer> maleAgeGroups = (Map<String, Integer>)dataMap.get('ageGroupsMale');
        Map<String, Integer> femaleAgeGroups = (Map<String, Integer>)dataMap.get('ageGroupsFemale');
        Integer totalMale=0;
        Integer totalFemale=0;
    
        for(Integer i=1; i<=6; i++){
            String maleKey1 = 'MALE_F' + i+'0T'+i+'4_LVPOP_CO';
            String femaleKey1 = 'FEMALE_F' + i+'0T'+i+'4_LVPOP_CO';
            String maleKey2 = 'MALE_F' + i+'5T'+i+'9_LVPOP_CO';
            String femaleKey2 = 'FEMALE_F' + i+'5T'+i+'9_LVPOP_CO';

            Integer maleCount1 = row.containsKey(maleKey1) ? safeIntegerConversion(row.get(maleKey1)) : 0;
            Integer femaleCount1 = row.containsKey(femaleKey1) ? safeIntegerConversion(row.get(femaleKey1)) : 0;
            Integer maleCount2 = row.containsKey(maleKey2) ? safeIntegerConversion(row.get(maleKey2)) : 0;
            Integer femaleCount2 = row.containsKey(femaleKey2) ? safeIntegerConversion(row.get(femaleKey2)) : 0;

            String ageGroupLabel=i+'0대';
            totalMale+=maleCount1+maleCount2;
            totalFemale+=femaleCount1+femaleCount2;
            maleAgeGroups.put(ageGroupLabel, maleAgeGroups.get(ageGroupLabel) + maleCount1+maleCount2);
            femaleAgeGroups.put(ageGroupLabel, femaleAgeGroups.get(ageGroupLabel) + femaleCount1+femaleCount2);
        }

        maleAgeGroups.put('총합', maleAgeGroups.get('총합') + totalMale);
        femaleAgeGroups.put('총합', femaleAgeGroups.get('총합') + totalFemale);

    }
    
}



