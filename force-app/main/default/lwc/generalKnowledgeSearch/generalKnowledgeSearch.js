import { LightningElement, track, wire } from 'lwc';
import getKnowledgeByProductAndSearch from '@salesforce/apex/ProductKnowledgeFetcher.getKnowledgeByProductAndSearch';

export default class GeneralKnowledge extends LightningElement {
    @track isListVisible = false; 
    @track knowledgeList = [];

    @wire(getKnowledgeByProductAndSearch, { 
        productName: '',
        rank: 0 
    })
    wiredGeneralKnowledge({ error, data }) {
        if (data) {
            this.knowledgeList = data.map(knowledge => ({
                id: knowledge.Id,
                title: knowledge.Title,
                summary: knowledge.Summary,
                question: knowledge.Question__c || '❓ 질문이 없습니다.',
                answer: knowledge.Answer__c || '💡 답변이 없습니다.',
                expanded: false 
            }));
        } else if (error) {
            console.error('❌ 일반 문의 가져오기 실패:', error);
        }
    }

    toggleKnowledgeList() {
        this.isListVisible = !this.isListVisible;
        const listElement = this.template.querySelector('.knowledge-list');
        if (listElement) {
            listElement.classList.toggle('show');
        }
    }

    toggleKnowledgeDetail(event) {
        const selectedId = event.currentTarget.dataset.id;
        
        this.knowledgeList = this.knowledgeList.map(knowledge => ({
            ...knowledge,
            expanded: knowledge.id === selectedId ? !knowledge.expanded : false
        }));

        setTimeout(() => {
            this.template.querySelectorAll('.knowledge-detail').forEach(detail => {
                if (detail.dataset.id === selectedId) {
                    detail.classList.toggle('show');
                } else {
                    detail.classList.remove('show');
                }
            });
        }, 10);
    }
}