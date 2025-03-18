import { LightningElement, wire, track } from 'lwc';
import { subscribe, MessageContext } from 'lightning/messageService';
import POPULATION_FILTER_CHANNEL from '@salesforce/messageChannel/PopulationFilterChannel__c';
import { loadScript } from 'lightning/platformResourceLoader';

export default class SeoulPopulationChart extends LightningElement {
    @track dataLoaded = false;
    @track data;
    subscription = null;

    selectedDateTime;
    selectedDongCode;

    @wire(MessageContext)
    messageContext;

    connectedCallback() {
        loadScript(this, 'https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js')
            .then(() => {
                this.dataLoaded = true;
                this.subscribeToMessageChannel();
            })
            .catch(error => {
                console.error('D3 not loaded', error);
            });
    }

    subscribeToMessageChannel() {
        if (!this.subscription) {
            this.subscription = subscribe(
                this.messageContext,
                POPULATION_FILTER_CHANNEL,
                (message) => this.handleMessage(message)
            );
        }
    }

    handleMessage(message) {
        console.log("📡 LMS 데이터 수신:", message);
        
        this.selectedDateTime = message.selectedDateTime;
        this.selectedDongCode = message.selectedDongCode;
        this.data = message.populationData; // 📌 LMS에서 받은 JSON 데이터를 바로 사용

        this.renderCharts(); // 📌 데이터가 들어오면 바로 차트 렌더링
    }

    renderCharts() {
        if (!this.dataLoaded || !this.data) return;
    
        const containers = this.template.querySelectorAll('.chart-container');
    
        containers.forEach((container) => {
            container.innerHTML = '';
            const ageGroup = container.getAttribute('data-age-group'); // 🔥 10대 ~ 60대
            const { min, max } = this.findAgeGroupBounds(ageGroup);
            this.renderChart(container, ageGroup, min, max);
        });
    }
    
    renderChart(container, ageGroup, min, max) {
        const containerRect = container.getBoundingClientRect();
        const svgWidth = containerRect.width || 400;
        const svgHeight = containerRect.height || 200;
    
        const margin = { top: 40, right: 30, bottom: 40, left: 70 }; // 🔥 왼쪽 마진 증가
    
        const chartWidth = svgWidth - margin.left - margin.right;
        const chartHeight = svgHeight - margin.top - margin.bottom;
    
        // 기존 SVG 삭제 후 다시 그리기
        container.innerHTML = '';
        const svg = d3.select(container)
            .append('svg')
            .attr('width', svgWidth)
            .attr('height', svgHeight);
    
        // 🔥 차트 제목 추가
        svg.append('text')
            .attr('x', svgWidth / 2)
            .attr('y', 20)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .style('font-weight', 'bold')
            .text(`${ageGroup}대`);
    
        const hours = ['09', '11', '13', '15', '17', '19','21'];
        const maleData = hours.map(hour => this.data[hour]?.ageGroupsMale?.[`${ageGroup}대`] || 0);
        const femaleData = hours.map(hour => this.data[hour]?.ageGroupsFemale?.[`${ageGroup}대`] || 0);
    
        const x = d3.scalePoint()
            .domain(hours)
            .range([margin.left, chartWidth + margin.left]);
    
        const y = d3.scaleLinear()
            .domain([min, max])
            .range([chartHeight + margin.top, margin.top])
            .nice();
    
        const line = d3.line()
            .x((_, i) => x(hours[i]))
            .y(d => y(d))
            .curve(d3.curveMonotoneX);
    
        const createPath = (data, color) => {
            svg.append('path')
                .datum(data)
                .attr('fill', 'none')
                .attr('stroke', color)
                .attr('stroke-width', 2)
                .attr('d', line);
    
            svg.selectAll('dot')
                .data(data)
                .enter().append('circle')
                .attr('cx', (d, i) => x(hours[i]))
                .attr('cy', d => y(d))
                .attr('r', 4)
                .attr('fill', color);
    
            // svg.selectAll('labels')
            //     .data(data)
            //     .enter().append('text')
            //     .attr('x', (d, i) => x(hours[i]))
            //     .attr('y', d => y(d) - 10)
            //     .attr('text-anchor', 'middle')
            //     .style('font-size', '10px')
            //     .text(d => d);
        };
    
        createPath(maleData, 'steelblue');
        createPath(femaleData, 'crimson');
    
        // ✅ **X축이 보이게 설정**
        svg.append('g')
            .attr('transform', `translate(0,${chartHeight + margin.top+5})`)
            .call(d3.axisBottom(x).tickSize(6))
            .selectAll('text')
            .style('font-size', '10px')
            .attr('dy', '0.5em');
    
        // ✅ **Y축 조정**
        svg.append('g')
            .attr('transform', `translate(${margin.left- 5},0)`)
            .call(d3.axisLeft(y).ticks(5))
            .selectAll('text')
            .style('font-size', '10px');
    }
    

    findMaxValue() {
        const hours = ['09', '11', '13', '15', '17', '19','21'];
        let maxVal = 0;

        for (let hour of hours) {
            for (let age of ['10대', '20대', '30대', '40대', '50대', '60대']) {
                const maleVal = this.data[hour]?.ageGroupsMale?.[age] || 0;
                const femaleVal = this.data[hour]?.ageGroupsFemale?.[age] || 0;
                maxVal = Math.max(maxVal, maleVal, femaleVal);
            }
        }
        return Math.ceil(maxVal / 1000) * 1000; // 📌 깔끔한 Y축 값 유지
    }

    findAgeGroupBounds(ageGroup) {
        const hours = ['09', '11', '13', '15', '17', '19','21'];
        let minVal = Infinity;
        let maxVal = -Infinity;
    
        for (let hour of hours) {
            const maleVal = this.data[hour]?.ageGroupsMale?.[`${ageGroup}대`] || 0;
            const femaleVal = this.data[hour]?.ageGroupsFemale?.[`${ageGroup}대`] || 0;
            minVal = Math.min(minVal, maleVal, femaleVal);
            maxVal = Math.max(maxVal, maleVal, femaleVal);
        }
        return { min: minVal, max: maxVal };
    }
}
