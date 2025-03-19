public without sharing class PromotionTask {
    @AuraEnabled
    public static Lead clearPromotionCodeFields(String promoCode) {
        List<Lead> leads = [SELECT Id, Name, Promotion_Code__c, Promotion_Issued_Date__c FROM Lead WHERE Promotion_Code__c = :promoCode LIMIT 1];
        if (!leads.isEmpty()) { 
            Lead selectlead = leads[0]; 
            selectlead.Promotion_Code__c = null;  
            selectlead.Promotion_Issued_Date__c = null; 
            update selectlead;
            return selectlead;
        } else {
            throw new AuraHandledException('No Lead found with this Promotion Code.');
        }
    }
}
