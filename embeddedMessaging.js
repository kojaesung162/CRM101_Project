var accountId, productId, caseRecordType;
var isMessagingReady = false;

window.addEventListener('onEmbeddedMessagingReady', () => {
  embeddedservice_bootstrap.settings.hideChatButtonOnLoad = true;
  isMessagingReady = true;

  if (accountId && productId && caseRecordType) {
    triggerEmbeddedMessaging();
  }
});

window.addEventListener('productInfo', function (e) {
  accountId = e.detail.accountId;
  productId = e.detail.productId;
  caseRecordType = e.detail.caseRecordType;
  embeddedservice_bootstrap.settings.hideChatButtonOnLoad = false;

  if (isMessagingReady) {
    triggerEmbeddedMessaging();
  }
});

function triggerEmbeddedMessaging() {
  try {
    embeddedservice_bootstrap.prechatAPI.setHiddenPrechatFields({
      accountIdField: accountId,
      productIdField: productId,
      recordType: caseRecordType,
      CaseOrigin: 'Web',
    });
  } catch (error) {
    console.error('❌ Error setting Prechat fields:', error);
  }
}
