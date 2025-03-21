public with sharing class LocationBatchProcessor implements Database.Batchable<Blob>, Database.Stateful {
    private Blob csvBlob;
    
    public LocationBatchProcessor() {
        try {
            StaticResource res = [SELECT Body FROM StaticResource WHERE Name = 'SeoulCafe' LIMIT 1];
            csvBlob = res.Body;

            if (csvBlob == null || csvBlob.size() == 0) {
                throw new AuraHandledException('CSV 파일이 비어 있습니다.');
            }
            
        } catch (Exception e) {
            throw new AuraHandledException('CSV 데이터를 읽는 중 오류 발생: ' + e.getMessage());
        }
    }

    public Iterable<Blob> start(Database.BatchableContext BC) {
        return new List<Blob>{ csvBlob }; 
    }

    public void execute(Database.BatchableContext BC, List<Blob> scope) {
        Map<String, CafeAnalysis__c> dataMap = new Map<String, CafeAnalysis__c>();

        for (Blob csvBlobData  : scope) {
            String csvData = csvBlobData .toString();
            csvData = csvData.replace('\r', ''); 

            Integer start = 0;
            Integer index = csvData.indexOf('\n', start);

            while (index != -1) {
                String line = csvData.substring(start, index).trim();
                if (start == 0) {
                    start = index + 1;
                    index = csvData.indexOf('\n', start);
                    continue;
                }

                List<String> values = line.split(',');

                String administrativeDongCode = String.valueOf(values[0]);
                String administrativeDong = values[1];
               
                if (!dataMap.containsKey(administrativeDongCode)) {
                    CafeAnalysis__c geo = new CafeAnalysis__c();
                    geo.Name = administrativeDongCode;
                    geo.AdministrativeDong__c = administrativeDong;
                    geo.TotalCount__c = 0; 
                    dataMap.put(administrativeDongCode, geo);
                }

                dataMap.get(administrativeDongCode).TotalCount__c += 1;

                start = index + 1;
                index = csvData.indexOf('\n', start);
            }
        }

        if (!dataMap.isEmpty()) {
            upsert dataMap.values();
        }
    }

    public void finish(Database.BatchableContext BC) {
        System.debug('Batch Apex 처리 완료!');
    }
}
