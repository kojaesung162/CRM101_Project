public with sharing class LocationBatchProcessor implements Database.Batchable<Blob>, Database.Stateful {
    private Blob csvBlob;
    
    public LocationBatchProcessor() {
        try {
            // ✅ Static Resource에서 CSV 파일 직접 읽기
            StaticResource res = [SELECT Body FROM StaticResource WHERE Name = 'SeoulCafe' LIMIT 1];
            csvBlob = res.Body;

            if (csvBlob == null || csvBlob.size() == 0) {
                throw new AuraHandledException('❌ CSV 파일이 비어 있습니다.');
            }
            
            System.debug('✅ CSV 파일 로드 성공! 크기: ' + csvBlob.size() + ' 바이트');

        } catch (Exception e) {
            System.debug('❌ CSV 데이터를 읽는 중 오류 발생: ' + e.getMessage());
            throw new AuraHandledException('❌ CSV 데이터를 읽는 중 오류 발생: ' + e.getMessage());
        }
    }

    public Iterable<Blob> start(Database.BatchableContext BC) {
        System.debug('✅ Batch Start! CSV Blob을 한 줄씩 처리');
        return new List<Blob>{ csvBlob }; // ✅ Blob 자체를 Batch에 전달
    }

    public void execute(Database.BatchableContext BC, List<Blob> scope) {
        Map<String, CafeAnalysis__c> dataMap = new Map<String, CafeAnalysis__c>();

        for (Blob csvBlobData  : scope) {
            String csvData = csvBlobData .toString();
            csvData = csvData.replace('\r', ''); // ✅ Windows 개행문자(\r) 제거

            // ✅ 한 줄씩 읽으면서 바로 처리
            Integer start = 0;
            Integer index = csvData.indexOf('\n', start);

            while (index != -1) {
                String line = csvData.substring(start, index).trim();
                if (start == 0) {
                    // ✅ 첫 번째 줄(헤더)은 무시
                    start = index + 1;
                    index = csvData.indexOf('\n', start);
                    continue;
                }

                List<String> values = line.split(',');

                // ✅ 데이터 유효성 체크
                // if (values.size() < 3) {
                //     System.debug('⚠️ CSV 데이터가 부족함: ' + line);
                //     start = index + 1;
                //     index = csvData.indexOf('\n', start);
                //     continue;
                // }

                // ✅ 필드 값 추출
                String administrativeDongCode = String.valueOf(values[0]);
                String administrativeDong = values[1];
                //String roadAddress = values[2];

                // ✅ 같은 법정동(동코드)이 이미 존재하면 개수 증가
                if (!dataMap.containsKey(administrativeDongCode)) {
                    CafeAnalysis__c geo = new CafeAnalysis__c();
                    geo.Name = administrativeDongCode;
                    geo.AdministrativeDong__c = administrativeDong;
                    geo.TotalCount__c = 0; // ✅ 초기값 설정
                    System.debug(geo);

                    dataMap.put(administrativeDongCode, geo);
                }

                dataMap.get(administrativeDongCode).TotalCount__c += 1;

                start = index + 1;
                index = csvData.indexOf('\n', start);
            }
        }

        if (!dataMap.isEmpty()) {
            upsert dataMap.values();
            System.debug('✅ ' + dataMap.size() + '개의 동별 데이터 저장 완료!');
        }
    }

    public void finish(Database.BatchableContext BC) {
        System.debug('✅ Batch Apex 처리 완료!');
    }
}
