public without sharing class GetAccount {
    @AuraEnabled(cacheable=true)
    public static Account getAccount(String accountId) {
        try {
            Account acc = [
                SELECT Id, Name, Phone 
                FROM Account 
                WHERE Id = :accountId
            ];
            return acc;
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching account: ' + e.getMessage());
        }
    }
}