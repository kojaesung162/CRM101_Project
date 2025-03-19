global class ScheduledGeoDataUpdater implements Schedulable {
    global void execute(SchedulableContext SC) {
        Database.executeBatch(new LocationBatchProcessor(), 200);
    }
}