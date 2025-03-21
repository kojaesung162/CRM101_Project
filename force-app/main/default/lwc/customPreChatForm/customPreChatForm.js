import { LightningElement, track } from 'lwc';

export default class CustomPreChatForm extends LightningElement {
    prechatDetails={
        "_subject": "",
        "Case_Reason": "",
        "description": ""
    };

    get caseReasonOptions() {
        return [
            { label: '작동정지', value: 'Failure' },
            { label: '오작동', value: 'Malfunction' },
            { label: '누수', value: 'Leakage' },
            { label: '기기파손', value: 'Damaged' },
            { label: '기타', value: 'Others' }
        ];
    }

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

    handleStartChat() {
        this.dispatchEvent(new CustomEvent(
            "prechatsubmit",
            {
                detail: {value: this.prechatDetails}
            }
        ));
    }
}
