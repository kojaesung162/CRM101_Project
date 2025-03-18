public without sharing class CaseController {
    @AuraEnabled(cacheable=true)
    public static List<Case> getCasesByAccount(String accountId) {
        try {
            List<Case> cslist = [
                SELECT Id, Status, Subject, CreatedDate 
                FROM Case 
                WHERE AccountId = :accountId
                AND Status != 'Closed'
            ];
            return cslist;
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching cases: ' + e.getMessage());
        }
    }
}