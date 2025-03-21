import { LightningElement, track } from 'lwc';

export default class LoadingScreen extends LightningElement {
    @track showImage = true; 

    connectedCallback() {
        setTimeout(() => {
            this.showImage = false;
        }, 3000);
    }
}