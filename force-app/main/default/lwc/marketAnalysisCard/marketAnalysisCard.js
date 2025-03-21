import { LightningElement, wire } from 'lwc';
import { subscribe, MessageContext } from 'lightning/messageService';
import PopulationFilterChannel from '@salesforce/messageChannel/PopulationFilterChannel__c';

export default class MarketAnalysisCard extends LightningElement {
    marketName = ''; 
    storeCount = ''; 
    population = '';
    malePercentage = '';
    femalePercentage = ''; 
    marketGrade = ''; 
    
    subscription = null;

    @wire(MessageContext)
    messageContext;

    connectedCallback() {
        this.subscribeToMessageChannel();
    }

    subscribeToMessageChannel() {
        if (!this.subscription) {
            this.subscription = subscribe(
                this.messageContext,
                PopulationFilterChannel,
                (message) => this.handleMessage(message)
            );
        }
    }

    handleMessage(message) {
        if (message) {
            this.marketName = message.selectedDong || '정보 없음';
            this.storeCount = message.selectedTotalcount || '0';
            this.population = message.populationData ? this.calculateTotalPopulation(message.populationData) : '0';

            if (message.populationData) {
                const { malePercentage, femalePercentage } = this.calculateGenderPercentage(message.populationData);
                this.malePercentage = malePercentage;
                this.femalePercentage = femalePercentage;
            }
            this.marketGrade = this.calculateMarketGrade();
        }
    }

    calculateTotalPopulation(populationData) {
        let totalPopulation = 0;
        for (let hour in populationData) {
            totalPopulation += populationData[hour].ageGroupsMale['총합'] || 0;
            totalPopulation += populationData[hour].ageGroupsFemale['총합'] || 0;
        }
        return totalPopulation.toLocaleString(); 
    }

    calculateGenderPercentage(populationData) {
        let totalMale = 0;
        let totalFemale = 0;

        for (let hour in populationData) {
            totalMale += populationData[hour].ageGroupsMale['총합'] || 0;
            totalFemale += populationData[hour].ageGroupsFemale['총합'] || 0;
        }

        let totalPopulation = totalMale + totalFemale;
        if (totalPopulation === 0) {
            return { malePercentage: '0', femalePercentage: '0' };
        }

        return {
            malePercentage: ((totalMale*0.9 / totalPopulation) * 100).toFixed(1),
            femalePercentage: (((totalFemale+(totalMale*0.1)) / totalPopulation) * 100).toFixed(1)
        };
    }

    calculateMarketGrade() {
        const storeCount = parseInt(this.storeCount) || 0;
        const population = parseInt(this.population.replace(/,/g, '')) || 0;
        const malePercent = parseFloat(this.malePercentage) || 0;
        const femalePercent = parseFloat(this.femalePercentage) || 0;
        const calculateValue=(population/(storeCount*7))*(femalePercent/malePercent);
    
        if (calculateValue>=639.98) {
            return 'A';
        } else if (calculateValue <= 639.98  && calculateValue >= 471.96 ) {
            return 'B';
            
        } else if (calculateValue <= 471.96  && calculateValue >= 356.89) {
            return 'C';
            
        } else {
            return 'D';
        }
    }
    
    get gradeClass() {
        switch (this.marketGrade) {
            case 'A': return 'grade-a';
            case 'B': return 'grade-b';
            case 'C': return 'grade-c';
            case 'D': return 'grade-d';
            default: return '';
        }
    }
}
