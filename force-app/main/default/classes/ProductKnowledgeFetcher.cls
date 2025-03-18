public without sharing class ProductKnowledgeFetcher {
    @AuraEnabled(cacheable=true)
    public static List<Knowledge__kav> getKnowledgeByProductAndSearch(String productName, Integer rank) {
        String queryString = 'SELECT Id, Title, UrlName, Summary, Question__c, Answer__c FROM Knowledge__kav WHERE PublishStatus = \'Online\'';
        if(rank==0){
            List<Id> excludedIds = new List<Id>();
            for(List<Knowledge__kav> exclude_knowledges : [SELECT Id, Title FROM Knowledge__kav WHERE PublishStatus = 'Online' AND (Title LIKE '[%' OR Title LIKE '<%')]){
                for(Knowledge__kav exclude_knowledge : exclude_knowledges){
                    excludedIds.add(exclude_knowledge.Id);
                }
            }
            return [SELECT Id, Title, UrlName, Summary, Question__c, Answer__c FROM Knowledge__kav WHERE PublishStatus = 'Online' AND ID NOT IN :excludedIds];
        }
        if (productName != null && productName.trim() != '') {
            queryString += ' AND Title LIKE \'%' + productName + ']%\'';
        }
        queryString += ' ORDER BY Title ASC';
        List<Knowledge__kav> result = Database.query(queryString);
        return result;
    }
}