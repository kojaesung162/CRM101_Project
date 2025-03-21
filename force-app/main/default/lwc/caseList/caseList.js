import { LightningElement, track, wire} from 'lwc';
import getCasesByAccount from '@salesforce/apex/CaseController.getCasesByAccount';
import getAccountName from '@salesforce/apex/GetAccount.getAccount';

export default class CaseList extends LightningElement {
    @track caseList = [];
    @track accountId = '';
    @track hasCases = false;
    @track f_newCasesCount = 0;
    @track f_workingCasesCount = 0;
    @track f_escalatedCasesCount = 0;
    @track titleCase = '';
    @track accountName='';

    connectedCallback() {
        const params = new URLSearchParams(window.location.search);
        this.accountId = params.get('accountId') || '';
        if (this.accountId) {
            this.loadCases();
        }
    }

    @wire(getAccountName, { accountId: '$accountId' })
        wiredAccount({ error, data }) {
            if (data) {
                this.accountName += " "+data.Name+"님의 문의 현황";
            } else if (error) {
                console.error('Error fetching Account Name:', error);
            }
        }

    loadCases() {
        getCasesByAccount({ accountId: this.accountId })
            .then(result => {
                const statusCounts = result.reduce((acc, cs) => {
                    if (acc[cs.Status]) {
                        acc[cs.Status] += 1;
                    } else {
                        acc[cs.Status] = 1;
                    }
                    return acc;
                }, {});
    
                this.caseList = result.map(cs => ({
                    ...cs,
                    formattedDate: this.formatDate(cs.CreatedDate),
                    currentStep: cs.Status
                }));
    
                this.hasCases = this.caseList.length > 0;

                const newCasesCount = statusCounts['New'] || 0;
                const workingCasesCount = statusCounts['Working'] || 0;
                const escalatedCasesCount = statusCounts['Escalated'] || 0;
                this.f_newCasesCount = newCasesCount;
                this.f_workingCasesCount = workingCasesCount;
                this.f_escalatedCasesCount = escalatedCasesCount;

                this.titleCase += ` 신규 접수: ${this.f_newCasesCount}  처리 중: ${this.f_workingCasesCount}  긴급 상승: ${this.f_escalatedCasesCount}`;
            })
            .catch(error => {
                console.error('Error fetching cases:', error);
                this.caseList = [];
                this.hasCases = false;
            });
    }

    get newCases() {
        return this.caseList.filter(cs => cs.Status === 'New');
    }

    get workingCases() {
        return this.caseList.filter(cs => cs.Status === 'Working');
    }

    get escalatedCases() {
        return this.caseList.filter(cs => cs.Status === 'Escalated');
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A'; 
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    }
}
