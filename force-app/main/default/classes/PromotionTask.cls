public without sharing class PromotionTask {
    @AuraEnabled
    public static Lead clearPromotionCodeFields(String promoCode) {
        // ✅ 1. 입력된 Promotion Code와 일치하는 Lead 찾기 (LIMIT 1 추가)
        List<Lead> leads = [SELECT Id, Name, Promotion_Code__c, Promotion_Issued_Date__c FROM Lead WHERE Promotion_Code__c = :promoCode LIMIT 1];

        // ✅ 2. 해당 Lead가 존재하면 `Promotion_Code__c` 및 `Promotion_Issued_Date__c` 필드를 `null`로 변경
        if (!leads.isEmpty()) {  // ✅ List에서 isEmpty()를 체크
            Lead selectlead = leads[0]; // ✅ 첫 번째 Lead 선택
            selectlead.Promotion_Code__c = null;  // 🔥 Promotion Code 삭제
            selectlead.Promotion_Issued_Date__c = null;  // 🔥 Issued Date 삭제

            update selectlead; // ✅ Lead 필드 업데이트
            return selectlead;
        } else {
            throw new AuraHandledException('No Lead found with this Promotion Code.');
        }
    }
}
