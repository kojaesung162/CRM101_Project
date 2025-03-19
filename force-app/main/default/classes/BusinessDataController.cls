public without sharing class BusinessDataController {
    @AuraEnabled(cacheable=true)
    public static CafeAnalysis__c getBusinessDataByDistrict(String placeName) {
        List<String> arr=placeName.split(' ');
        CafeAnalysis__c dataList = [
            SELECT AdministrativeDong__c, Totalcount__c, Name
            FROM CafeAnalysis__c
            WHERE AdministrativeDong__c LIKE :('%' + arr[3] + '%') Limit 1
        ];
        return dataList;
    }
}
