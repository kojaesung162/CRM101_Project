public without sharing class GetPromotionCode {
    @AuraEnabled(cacheable=true)
    public static Boolean getPromotionCode(String inputCode) {
        // ✅ Salesforce에서 저장된 Promotion Code 조회
        List<Knowledge_Check__c> promoCodes = [
            SELECT Promotion_Code__c FROM Knowledge_Check__c
        ];

        // ✅ 입력값이 DB에 존재하는지 확인
        for (Knowledge_Check__c record : promoCodes) {
            if (record.Promotion_Code__c == inputCode) {
                return true; // 🔥 존재하면 true 반환
            }
        }
        return false; // ❌ 존재하지 않으면 false 반환
    }
}