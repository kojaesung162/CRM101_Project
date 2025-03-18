import { LightningElement, wire } from 'lwc';
import { subscribe, MessageContext } from 'lightning/messageService';
import PopulationFilterChannel from '@salesforce/messageChannel/PopulationFilterChannel__c';

export default class MarketAnalysisCard extends LightningElement {
    marketName = ''; // 🔥 동 이름
    storeCount = ''; // 🔥 점포 수
    population = ''; // 🔥 유동인구 총합
    malePercentage = ''; // 🔥 남성 퍼센트
    femalePercentage = ''; // 🔥 여성 퍼센트
    marketGrade = ''; // 🔥 등급 (A, B, C, D)
    
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
        console.log("📡 LMS 데이터 수신:", message);

        if (message) {
            this.marketName = message.selectedDong || '정보 없음';
            this.storeCount = message.selectedTotalcount || '0';
            this.population = message.populationData ? this.calculateTotalPopulation(message.populationData) : '0';

            // 🔥 남성 & 여성 비율 계산
            if (message.populationData) {
                const { malePercentage, femalePercentage } = this.calculateGenderPercentage(message.populationData);
                this.malePercentage = malePercentage;
                this.femalePercentage = femalePercentage;
            }

            this.marketGrade = this.calculateMarketGrade();
        }
    }

    // 🔥 유동인구 총합 계산 (message.populationData에서 가져오기)
    calculateTotalPopulation(populationData) {
        let totalPopulation = 0;
        for (let hour in populationData) {
            totalPopulation += populationData[hour].ageGroupsMale['총합'] || 0;
            totalPopulation += populationData[hour].ageGroupsFemale['총합'] || 0;
        }
        return totalPopulation.toLocaleString(); // 🔥 천 단위 콤마 추가
    }

    // 🔥 남성 비율 & 여성 비율 계산
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

    // 🔥 등급 산정 로직
    calculateMarketGrade() {
        const storeCount = parseInt(this.storeCount) || 0;
        const population = parseInt(this.population.replace(/,/g, '')) || 0;
        const malePercent = parseFloat(this.malePercentage) || 0;
        const femalePercent = parseFloat(this.femalePercentage) || 0;
        const calculateValue=(population/(storeCount*7))*(femalePercent/malePercent);
    
        // 여성비율이 70% 이상이고 남성비율이 30% 미만인 경우를 'A' 등급으로 분류
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
