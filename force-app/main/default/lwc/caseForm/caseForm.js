import { LightningElement, track, wire } from 'lwc';
import { publish, subscribe, MessageContext } from 'lightning/messageService';
import PRODUCT_MESSAGE from '@salesforce/messageChannel/ProductMessageChannel__c';

export default class CaseForm extends LightningElement {
    @track isModalOpen = false;
    @track accountId = '';
    @track productId = '';
    @track productName = '';
    @track productCategory = '';
    @track retURL = 'https://crm10167-dev-ed.develop.my.site.com/asSupport/s/?accountId=';
    @track caseRecordType = '012Qy000005M7MX';
    subscription = null;

    @wire(MessageContext)
    messageContext;
    connectedCallback() {
        
        const params = new URLSearchParams(window.location.search);
        this.accountId = params.get('accountId') || '';
        this.retURL += this.accountId;

        if (this.messageContext && !this.subscription) {
            this.subscription = subscribe(this.messageContext, PRODUCT_MESSAGE, (message) => {
                this.productId=message.productId;
                this.productName=message.productName;
                this.productCategory=message.productCategory;
                if (message.productCategory === '커피트럭') {
                    this.caseRecordType = '012Qy000005M7RN'; 
                } 
                else {
                    this.caseRecordType = '012Qy000005M7MX'; 
                }
            });
        }
    }

    openModal() {
        this.isModalOpen = true;
        publish(this.messageContext, PRODUCT_MESSAGE, {
            productId: this.productId,
            productName: this.productName,
            productCategory: this.productCategory,
            progressValue: 100
        });
    }

    closeModal() {
        this.isModalOpen = false;
    }
}