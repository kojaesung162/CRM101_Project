import { LightningElement, track } from 'lwc';

export default class CustomPreChatForm extends LightningElement {
    @track _subject = '';
    @track Case_Reason = '';
    @track description = '';
    prechatDetails={
        "_subject": "",
        "Case_Reason": "",
        "description": ""
    };

    // Case Reason 옵션
    get caseReasonOptions() {
        return [
            { label: '작동정지', value: 'Failure' },
            { label: '오작동', value: 'Malfunction' },
            { label: '누수', value: 'Leakage' },
            { label: '기기파손', value: 'Damaged' },
            { label: '기타', value: 'Others' }
        ];
    }

    // 입력값 변경 핸들러
    handleInputChange(event) {
        if(event.target.name=='_subject'){
            this.prechatDetails._subject=String(event.target.value);
        }
        else if(event.target.name=='Case_Reason'){
            this.prechatDetails.Case_Reason=String(event.target.value);
        }
        else if(event.target.name=='description'){
            this.prechatDetails.description=String(event.target.value);
        }
    }

    // Chat 시작 함수
    handleStartChat() {
        this.dispatchEvent(new CustomEvent(
            "prechatsubmit",
            {
                detail: {value: this.prechatDetails}
            }
        ));
    }
}
