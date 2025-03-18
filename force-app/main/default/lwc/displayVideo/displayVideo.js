import { LightningElement } from 'lwc';
import videoFile from '@salesforce/resourceUrl/CafeAnalysis';

export default class Eventvideo extends LightningElement {
    videoUrl = videoFile;

    renderedCallback(){
        const video = this.template.querySelector("#videoElement");
        if (video){
            video.play().catch(error => {
                console.error("Autoplay blocked:", error);
            });
        }
    }
}