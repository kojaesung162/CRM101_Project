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
    @track caseRecordType = '012Qy000005M7MX'; // ✅ 기본값 (Cafe)
    subscription = null;

    @wire(MessageContext)
    messageContext;
    // 🔹 세션에서 accountId 불러오기
    connectedCallback() {
        
        const params = new URLSearchParams(window.location.search);
        this.accountId = params.get('accountId') || '';
        this.retURL += this.accountId;
        console.log('Extracted accountId:', this.accountId);

        // ✅ LMS 구독 (productCategory에 따라 caseRecordType 변경)
        if (this.messageContext && !this.subscription) {
            this.subscription = subscribe(this.messageContext, PRODUCT_MESSAGE, (message) => {
                console.log('🔹 Received Product Category:', message.productCategory);
                this.productId=message.productId;
                this.productName=message.productName;
                this.productCategory=message.productCategory;
                console.log(message.productId);
                if (message.productCategory === '커피트럭') {
                    this.caseRecordType = '012Qy000005M7RN'; // ✅ Cafe의 Record Type ID
                } 
                else {
                    this.caseRecordType = '012Qy000005M7MX'; // 기본값
                }
                
                console.log('🔹 Updated Case Record Type:', this.caseRecordType);
            });
        }
    }

    // 🔹 모달 열기
    openModal() {
        this.isModalOpen = true;
        publish(this.messageContext, PRODUCT_MESSAGE, {
            productId: this.productId,
            productName: this.productName,
            productCategory: this.productCategory,
            progressValue: 100
        });
    }

    // 🔹 모달 닫기
    closeModal() {
        this.isModalOpen = false;
    }
}