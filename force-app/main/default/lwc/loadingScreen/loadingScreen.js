import { LightningElement, track } from 'lwc';

export default class LoadingScreen extends LightningElement {
    @track showImage = true; // ✅ 처음에는 이미지 표시

    connectedCallback() {
        // ✅ 3초 후에 이미지 숨기기
        setTimeout(() => {
            this.showImage = false;
        }, 3000);
    }

    
}