public without sharing class ProductFetcher {
    @AuraEnabled(cacheable=true)
    public static List<AggregateResult> getProductsByAccount(String accountId) {
        return [
            SELECT Product2.Id productId,Product2.ProductCode name, Product2.Family category, 
                   SUM(Quantity) totalQuantity, SUM(TotalPrice) totalRevenue
            FROM OrderItem
            WHERE Order.AccountId = :accountId
            GROUP BY Product2.Id, Product2.ProductCode, Product2.Family
        ];
    }
}