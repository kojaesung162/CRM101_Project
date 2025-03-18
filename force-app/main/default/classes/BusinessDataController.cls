public without sharing class BusinessDataController {
    @AuraEnabled(cacheable=true)
    public static CafeAnalysis__c getBusinessDataByDistrict(String placeName) {
        Map<String, Integer> dataMap = new Map<String, Integer>();

        // ✅ 서울특별시 구 코드 매핑 (5자리 기준)
        Map<String, String> seoulDistricts = new Map<String, String>{
            '11110' => '종로구', '11140' => '중구', '11170' => '용산구',
            '11200' => '성동구', '11215' => '광진구', '11230' => '동대문구',
            '11260' => '중랑구', '11290' => '성북구', '11305' => '강북구',
            '11320' => '도봉구', '11350' => '노원구', '11380' => '은평구',
            '11410' => '서대문구', '11440' => '마포구', '11470' => '양천구',
            '11500' => '강서구', '11530' => '구로구', '11545' => '금천구',
            '11560' => '영등포구', '11590' => '동작구', '11620' => '관악구',
            '11650' => '서초구', '11680' => '강남구', '11710' => '송파구',
            '11740' => '강동구'
        };
        if(placeName=='대한민국 서울특별시 서초구 서초동'){
            placeName='대한민국 서울특별시 서초구 서초1동';
        }
        if(placeName=='대한민국 서울특별시 서초구 양재동'){
            placeName='대한민국 서울특별시 서초구 양재1동';
        }

        List<String> arr=placeName.split(' ');

        // ✅ TotalLocation__c 객체에서 해당 지역의 데이터 조회
        CafeAnalysis__c dataList = [
            SELECT AdministrativeDong__c, Totalcount__c, Name
            FROM CafeAnalysis__c
            WHERE AdministrativeDong__c LIKE :('%' + arr[3] + '%') Limit 1
        ];

        return dataList;
    }
}
