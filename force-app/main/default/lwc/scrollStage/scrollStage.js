import { LightningElement, track, wire } from 'lwc';
import { subscribe, MessageContext } from 'lightning/messageService';
import PRODUCT_MESSAGE from '@salesforce/messageChannel/ProductMessageChannel__c';

export default class ScrollStage extends LightningElement {
    @track currentStep = "1";
    subscription = null;

    @wire(MessageContext) messageContext;

    connectedCallback() {
        setTimeout(() => {
            this.currentStep="2";
        }, 4000); 
        this.subscription = subscribe(this.messageContext, PRODUCT_MESSAGE, (message) => {
            setTimeout(() => {
                this.currentStep="3";
            }, 1000);
        });

        window.addEventListener("onEmbeddedMessagingConversationStarted",() =>{
            this.currentStep="4";
        });
        
    }

    disconnectedCallback() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}