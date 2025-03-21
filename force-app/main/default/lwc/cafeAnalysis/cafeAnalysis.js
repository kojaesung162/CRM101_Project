import { LightningElement, track, wire } from 'lwc';
import { publish, MessageContext } from 'lightning/messageService';
import PopulationFilterChannel from '@salesforce/messageChannel/PopulationFilterChannel__c';
import mapboxResource from '@salesforce/resourceUrl/mapbox_iframe';
import mapboxResourceWeb from '@salesforce/resourceUrl/mapbox_iframe_web';
import getBusinessDataByDistrict from '@salesforce/apex/BusinessDataController.getBusinessDataByDistrict';
import getSeoulPopulation from '@salesforce/apex/SeoulPopulationService.getSeoulPopulation';
import updateSearchLocation from '@salesforce/apex/LeadSearchUpdater.updateSearchLocation';

export default class BusinessHeatmap extends LightningElement {
    @track placeName = '';
    @track selectedDongCode = ''; 
    @track selectedTotalcount = '';
    @track leadId = '';
    hasRendered = false;
    d3Initialized = false;

    @wire(MessageContext)
    messageContext;

    renderedCallback() {
        this.getLeadIdFromURL();
        if (!this.hasRendered) {
            this.loadMapboxIframe();
            window.addEventListener('message', this.handleMessage.bind(this));
            this.hasRendered = true;
        }
        if (this.d3Initialized) {
            return;
        }
        this.d3Initialized = true;

        Promise.all([
            this.loadD3('https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js')
        ])
        .then(() => {
            this.createGradientBar();
        })
        .catch(error => {
            console.error('D3.js 로드 실패:', error);
        });
    }

    getLeadIdFromURL() {
        const params = new URLSearchParams(window.location.search);
        const leadId = params.get('leadid');

        if (leadId) {
            this.leadId = leadId;
        }
    }

    loadMapboxIframe() {
        const mapContainer = this.template.querySelector('.map-container');
        if (!mapContainer) {
            console.error("map-container를 찾을 수 없습니다.");
            return;
        }
        while (mapContainer.firstChild) {
            mapContainer.removeChild(mapContainer.firstChild);
        }
        const iframe = document.createElement('iframe');
        iframe.width = '100%';
        iframe.height = '1300px';
        iframe.style.border = 'none';
        iframe.src = this.leadId ? mapboxResourceWeb : mapboxResource;
        mapContainer.appendChild(iframe);
    }

    handleMessage(event) {
        if (event.origin !== window.location.origin) {
            return;
        }
        if (event.data && event.data.placeName) {
            this.placeName = event.data.placeName;
                this.fetchBusinessData();
        }
    }

    fetchBusinessData() {
        getBusinessDataByDistrict({ placeName: this.placeName })
            .then((result) => {
                if (result) {
                    this.selectedDongCode = result.Name;
                    this.selectedTotalcount = result.Totalcount__c;
                    this.fetchPopulationData();
                    if (this.leadId && this.placeName) {
                        this.updateLeadSearchLocation();
                    }
                } else {
                    console.warn('동 코드가 없음! 데이터 확인 필요');
                }
            })
            .catch((error) => {
                console.error('Error fetching business data:', error);
            });
    }
    
    fetchPopulationData() {
        getSeoulPopulation({
            selectedDongCode: this.selectedDongCode
        })
        .then((result) => {
            const parsedData = JSON.parse(result);

            const payload = {
                selectedDongCode: this.selectedDongCode,
                populationData: parsedData,
                selectedTotalcount: this.selectedTotalcount,
                selectedDong: this.placeName
            };
            publish(this.messageContext, PopulationFilterChannel, payload);
        })
        .catch((error) => {
            console.error('데이터 가져오기 실패:', error);
        });
    }

    updateLeadSearchLocation() {
        updateSearchLocation({ 
            leadId: this.leadId, 
            newLocation: this.placeName 
        })
        .then(() => {
            console.log(`Lead (${this.leadId})의 업데이트: ${this.placeName}`);
        })
        .catch(error => {
            console.error(`Lead SearchLocation 업데이트 실패: ${error}`);
        });
    }

    loadD3(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('D3.js 로드 실패'));
            document.head.appendChild(script);
        });
    }

    createGradientBar() {
        const svg = d3.select(this.template.querySelector('.gradient-bar'))
            .attr('width', 80) 
            .attr('height', 330); 

            svg.append("text")
            .attr("x", 40) 
            .attr("y", 20) 
            .attr("text-anchor", "middle") 
            .attr("font-size", "14px")
            .attr("font-weight", "bold")
            .attr("fill", "white")
            .text("카페"); 
    
        const defs = svg.append("defs");
        const gradient = defs.append("linearGradient")
            .attr("id", "gradient")
            .attr("x1", "0%").attr("y1", "0%")
            .attr("x2", "0%").attr("y2", "100%"); 
    
        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "hsl(340, 74%, 47%)"); 

        gradient.append("stop")
            .attr("offset", "50%")
            .attr("stop-color", "hsla(55, 96%, 64%, 0.88)"); 

        gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "hsla(0, 80%, 73%, 0)"); 
            
        svg.append("rect")
            .attr("x", 30)
            .attr("y", 30)
            .attr("width", 20)
            .attr("height", 300) 
            .style("fill", "url(#gradient)")
            .style("stroke", "black");
    
        const labels = [
            { value: 100, position: 50 },
            { value: 50, position: 180 },
            { value: 1, position: 320 }
        ];
    
        labels.forEach((d) => {
            svg.append("text")
                .attr("x", 55) 
                .attr("y", d.position)
                .attr("text-anchor", "start")
                .attr("font-size", "14px") 
                .attr("font-weight", "bold")
                .attr("fill", "white") 
                .text(d.value);
        });
    }
}
