public without sharing class LeadSearchUpdater {
    @AuraEnabled
    public static void updateSearchLocation(String leadId, String newLocation) {
        Lead leadToUpdate = [SELECT Id, SearchLocation__c FROM Lead WHERE Id = :leadId LIMIT 1];
        if (leadToUpdate != null) {
            leadToUpdate.SearchLocation__c = newLocation;  
            update leadToUpdate; 
        } else {
            throw new AuraHandledException('해당 Lead를 찾을 수 없습니다.');
        }
    }
}
