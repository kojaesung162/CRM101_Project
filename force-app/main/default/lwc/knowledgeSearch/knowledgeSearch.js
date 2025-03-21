import { LightningElement, wire, track } from 'lwc';
import { subscribe, MessageContext } from 'lightning/messageService';
import PRODUCT_MESSAGE from '@salesforce/messageChannel/ProductMessageChannel__c';
import getKnowledgeByProductAndSearch from '@salesforce/apex/ProductKnowledgeFetcher.getKnowledgeByProductAndSearch';

export default class KnowledgeSearch extends LightningElement {
    @track selectedProductName = '';
    @track selectedProductCategory = '';
    @track knowledgeArticles = [];
    @track isLoading = false; 

    subscription = null;

    @wire(MessageContext) messageContext;

    connectedCallback() {
        this.subscription = subscribe(this.messageContext, PRODUCT_MESSAGE, (message) => {
            if (this.selectedProductCategory !== message.productCategory) {
                this.selectedProductCategory = message.productCategory;
                this.selectedProductName=message.productName;
            }
        });
    }

    @wire(getKnowledgeByProductAndSearch, { productName: '$selectedProductCategory', rank: 1 })
    wiredKnowledge({ error, data }) {
        this.isLoading = true;
        if (data) {
            this.knowledgeArticles = data.map(article => ({
                id: article.Id,
                title: article.Title,
                summary: article.Summary,
                question: article.Question__c || '❓ 질문이 없습니다.',
                answer: article.Answer__c || '💡 답변이 없습니다.',
                expanded: false,
                answerClass: 'faq-answer-container' 
            }));
        } else if (error) {
            console.error('❌ Knowledge 데이터 가져오기 오류:', error);
            this.knowledgeArticles = [];
        }
        this.isLoading = false;
    }

    toggleKnowledge(event) {
        const selectedId = event.currentTarget.dataset.id;
        this.knowledgeArticles = this.knowledgeArticles.map(article => ({
            ...article,
            expanded: article.id === selectedId ? !article.expanded : false,
            answerClass: article.id === selectedId
                ? (article.expanded ? 'faq-answer-container' : 'faq-answer-container show')
                : 'faq-answer-container'
        }));

        setTimeout(() => {
            this.knowledgeArticles = [...this.knowledgeArticles];
        }, 10);
    }
}
