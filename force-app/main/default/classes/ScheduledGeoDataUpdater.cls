global class ScheduledGeoDataUpdater implements Schedulable {
    global void execute(SchedulableContext SC) {
        System.debug('✅ Scheduled Apex 실행 중...');

        // ✅ Batch Apex 실행 (CSV 읽고 데이터 저장)
        Database.executeBatch(new LocationBatchProcessor(), 200);
    }
}