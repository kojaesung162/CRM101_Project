public without sharing class SeoulPopulationService {
    @AuraEnabled(cacheable=true)
    public static String getSeoulPopulation(String selectedDongCode) {
        String openai='Put_Your_Api_Key';
        String formattedDate='20250226';
        List<String> hours = new List<String>{'09', '11', '13', '15', '17', '19','21'};
        Map<String, Map<String, Object>> timeGroupedData = new Map<String, Map<String, Object>>();

        for (String hour : hours) {
            String apiUrl = 'http://openapi.seoul.go.kr:8088/'+openai+'/json/SPOP_LOCAL_RESD_DONG/1/1/'
                + formattedDate + '/' + hour + '/' + selectedDongCode;
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint(apiUrl);
            request.setMethod('GET');
            request.setTimeout(60000);
            HttpResponse response = http.send(request);
            if (response.getStatusCode() == 200) {

                aggregatePopulationData(response.getBody(), timeGroupedData, hour);
            } else {
                System.debug('Failed to fetch data for hour ' + hour + ': ' + response.getStatus());
            }
        }
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
            Decimal decimalValue = Decimal.valueOf(String.valueOf(value));
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



