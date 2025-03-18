import { LightningElement, track } from 'lwc';
import getPromotionCode from '@salesforce/apex/GetPromotionCode.getPromotionCode';
import updatePromotionCodeStatus from '@salesforce/apex/PromotionTask.clearPromotionCodeFields';

export default class RedirectInput extends LightningElement {
    @track userInput = '';  // 🔥 사용자 입력 값
    @track statusMessage = ''; // 🔥 상태 메시지

    // ✅ 입력 값 변경 감지
    handleInputChange(event) {
        this.userInput = event.target.value;
    }

    // ✅ 제출 버튼 클릭 시 실행
    handleSubmit() {
        if (!this.userInput) {
            this.statusMessage = '⚠️ 코드를 작성해 주세요!';
            return;
        }

        // 🔥 Apex 호출하여 코드 검증
        getPromotionCode({ inputCode: this.userInput })
            .then((isValid) => {
                if (isValid) {
                    this.statusMessage = '✅ 확인되었습니다. 잠시만 기다려 주세요.';

                    // ✅ Lead 업데이트 후 URL 리디렉트
                    return this.updateLead();
                } else {
                    this.statusMessage = '❌ 옳지 않은 코드입니다. 다시 한번 시도해주세요.';
                    return null;
                }
            })
            .catch((error) => {
                console.error('🚨 Error fetching promotion code:', error);
                this.statusMessage = '⚠️ Error checking the code. Please try again.';
            });
    }

    // ✅ Lead 업데이트 후 ID 받아서 URL에 추가
    updateLead() {
        updatePromotionCodeStatus({ promoCode: this.userInput })
        .then(leadId => {
            if (leadId) {
                this.statusMessage = `✅ Lead Updated! Redirecting...`;

                // ✅ 리드 ID를 URL에 추가하여 이동
                setTimeout(() => {
                    window.location.href = `https://crm10167-dev-ed.develop.my.site.com/cafeAnalysis/s/?leadid=${leadId.Id}`;
                }, 1000); // 1초 후 이동
            } else {
                this.statusMessage = '⚠️ No Lead ID received.';
            }
        })
        .catch(error => {
            console.error('🚨 Error updating Lead:', error);
            this.statusMessage = '⚠️ Error updating the Lead. Please try again.';
        });
    }
}
