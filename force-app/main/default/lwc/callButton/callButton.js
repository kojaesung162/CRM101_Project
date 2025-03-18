import { LightningElement } from 'lwc';

export default class CallButton extends LightningElement {
    openCall() {
        console.log("전화 걸기 버튼 클릭됨");
        window.open("tel:+821012345678", "_self");
    }
}