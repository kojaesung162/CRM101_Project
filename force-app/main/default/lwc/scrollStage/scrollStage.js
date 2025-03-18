import { LightningElement, track, wire } from 'lwc';
import { subscribe, MessageContext } from 'lightning/messageService';
import PRODUCT_MESSAGE from '@salesforce/messageChannel/ProductMessageChannel__c';

export default class ScrollStage extends LightningElement {
    @track scrollPercentage = 0;
    @track currentStep = "1";
    subscription = null;

    @wire(MessageContext) messageContext;

    get progressStyle() {
        return `width: ${this.scrollPercentage}%;`;
    }

    connectedCallback() {
        // window.addEventListener('scroll', this.handleScroll.bind(this));

        setTimeout(() => {
            this.updateProgressBar(33);
            this.currentStep="2";
            console.log(this.currentStep);
        }, 4000); // 1000ms = 1초
        this.subscription = subscribe(this.messageContext, PRODUCT_MESSAGE, (message) => {
            setTimeout(() => {
                this.updateProgressBar(message.progressValue);
                this.currentStep="3";
            }, 1000);
        });

        window.addEventListener("onEmbeddedMessagingConversationStarted",() =>{
            console.log("💬 Chat session started!");
            this.scrollPercentage=100;
            this.currentStep="4";
        });
        
    }

    disconnectedCallback() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    updateProgressBar(value) {
        if (value > this.scrollPercentage) {
            this.scrollPercentage = value;
        }
    }
}