public without sharing class LeadSearchUpdater {
    @AuraEnabled
    public static void updateSearchLocation(String leadId, String newLocation) {
        // ✅ 1. Lead 레코드 조회
        Lead leadToUpdate = [SELECT Id, SearchLocation__c FROM Lead WHERE Id = :leadId LIMIT 1];

        // ✅ 2. Lead 존재 여부 확인 후 업데이트
        if (leadToUpdate != null) {
            leadToUpdate.SearchLocation__c = newLocation;  // 🔥 새로운 위치 값 설정
            update leadToUpdate; // ✅ 필드 업데이트
        } else {
            throw new AuraHandledException('❌ 해당 Lead를 찾을 수 없습니다.');
        }
    }
}
