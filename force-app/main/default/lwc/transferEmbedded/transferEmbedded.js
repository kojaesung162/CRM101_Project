import { LightningElement, track, wire  } from 'lwc';
import { subscribe, MessageContext } from 'lightning/messageService';
import PRODUCT_MESSAGE from '@salesforce/messageChannel/ProductMessageChannel__c';

export default class TransferEmbedded extends LightningElement {
    @track accountId = '';
    @track productId = '';
    @track productName = '';
    @track productCategory = '';
    @track caseRecordType = '012Qy000005M7MX'; 
    subscription = null;

    @wire(MessageContext)
    messageContext;

    connectedCallback() {
        if (this.messageContext && !this.subscription) {
            this.subscription = subscribe(this.messageContext, PRODUCT_MESSAGE, (message) => {
                this.accountId=message.accountId;
                this.productId = message.productId;
                this.productName = message.productName;
                this.productCategory = message.productCategory;
                
                if (message.productCategory === '커피트럭') {
                    this.caseRecordType = '012Qy000005M7RN'; 
                } else {
                    this.caseRecordType = '012Qy000005M7MX';
                }

                var selectedEvent = new CustomEvent('productInfo', {
                    detail: {
                        accountId: this.accountId,
                        productId: this.productId,
                        caseRecordType: this.caseRecordType
                    },
                    bubbles: true, 
                    composed: true 
                });
                document.getElementById('embeddedMessagingConversationButton').style.display = 'block';
                window.dispatchEvent(selectedEvent);
            });
        }
    }
}