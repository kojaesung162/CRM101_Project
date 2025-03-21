import { LightningElement } from 'lwc';

export default class CallButton extends LightningElement {
    openCall() {
        window.open("tel:+821012345678", "_self");
    }
}