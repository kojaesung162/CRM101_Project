import { LightningElement, track } from 'lwc';
import getPromotionCode from '@salesforce/apex/GetPromotionCode.getPromotionCode';
import updatePromotionCodeStatus from '@salesforce/apex/PromotionTask.clearPromotionCodeFields';

export default class RedirectInput extends LightningElement {
    @track userInput = '';  
    @track statusMessage = '';

    handleInputChange(event) {
        this.userInput = event.target.value;
    }

    handleSubmit() {
        if (!this.userInput) {
            this.statusMessage = '⚠️ 코드를 작성해 주세요!';
            return;
        }

        getPromotionCode({ inputCode: this.userInput })
            .then((isValid) => {
                if (isValid) {
                    this.statusMessage = '✅ 확인되었습니다. 잠시만 기다려 주세요.';
                    return this.updateLead();
                } else {
                    this.statusMessage = '❌ 옳지 않은 코드입니다. 다시 한번 시도해주세요.';
                    return null;
                }
            })
            .catch((error) => {
                this.statusMessage = '⚠️ Error checking the code. Please try again.';
            });
    }

    updateLead() {
        updatePromotionCodeStatus({ promoCode: this.userInput })
        .then(leadId => {
            if (leadId) {
                setTimeout(() => {
                    window.location.href = `https://crm10167-dev-ed.develop.my.site.com/cafeAnalysis/s/?leadid=${leadId.Id}`;
                }, 1000); 
            } else {
                this.statusMessage = '⚠️ LeadID가 존재하지 않습니다.';
            }
        })
        .catch(error => {
            this.statusMessage = '⚠️ Error updating the Lead. Please try again.';
        });
    }
}
