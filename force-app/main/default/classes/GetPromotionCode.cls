public without sharing class GetPromotionCode {
    @AuraEnabled(cacheable=true)
    public static Boolean getPromotionCode(String inputCode) {
        List<Knowledge_Check__c> promoCodes = [
            SELECT Promotion_Code__c FROM Knowledge_Check__c
        ];
        for (Knowledge_Check__c record : promoCodes) {
            if (record.Promotion_Code__c == inputCode) {
                return true;
            }
        }
        return false;
    }
}