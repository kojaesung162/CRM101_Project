import { LightningElement, track, wire } from 'lwc';
import getKnowledgeByProductAndSearch from '@salesforce/apex/ProductKnowledgeFetcher.getKnowledgeByProductAndSearch';

export default class GeneralKnowledge extends LightningElement {
    @track isListVisible = false; // ✅ 리스트 전체 토글 상태
    @track selectedKnowledgeId = null; // ✅ 선택된 지식 ID
    @track knowledgeList = []; // ✅ 일반 지식 리스트

    // 🔹 Apex 호출해서 일반 지식 목록 가져오기
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
                expanded: false // ✅ 기본적으로 닫힘
            }));
        } else if (error) {
            console.error('❌ 일반 지식 가져오기 실패:', error);
        }
    }

    // 🔹 "📚 일반 지식 보기" 버튼 클릭 시 리스트 전체 토글
    toggleKnowledgeList() {
        this.isListVisible = !this.isListVisible;
        const listElement = this.template.querySelector('.knowledge-list');
        if (listElement) {
            listElement.classList.toggle('show');
        }
    }

    // 🔹 특정 지식 클릭 시 상세 내용 토글
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