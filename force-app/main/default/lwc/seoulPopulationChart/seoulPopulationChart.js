import { LightningElement, track, wire } from 'lwc';
import { subscribe, MessageContext } from 'lightning/messageService';
import POPULATION_FILTER_CHANNEL from '@salesforce/messageChannel/PopulationFilterChannel__c';

export default class PopulationChart extends LightningElement {
    @track populationData = {};
    d3Initialized = false;
    d3Url = 'https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js';

    subscription = null;

    @wire(MessageContext)
    messageContext;

    connectedCallback() {
        this.subscribeToMessageChannel();
        this.loadD3();
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
        this.populationData = message.populationData;

        if (this.populationData) {
            this.renderCharts();
        } else {
            console.warn("⚠️ 인구 데이터가 없음!");
        }
    }

    loadD3() {
        if (this.d3Initialized) return;

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = this.d3Url;
            script.onload = () => {
                this.d3Initialized = true;
                resolve();
            };
            script.onerror = (error) => {
                console.error('Error loading D3:', error);
                reject(error);
            };
            document.body.appendChild(script);
        });
    }

    renderCharts() {
        if (!this.populationData) return;

        const containers = this.template.querySelectorAll('.chart-container');

        containers.forEach((container) => {
            const hour = container.getAttribute('data-hour'); 
            const dataForHour = this.populationData[hour];

            if (!dataForHour) return;

            this.renderChart(container, dataForHour, hour);
        });
    }

    renderChart(container, dataForHour, hour) {
        const containerRect = container.getBoundingClientRect();
        const svgWidth = containerRect.width || 550;
        const svgHeight = containerRect.height || 250;
    
        const margin = { top: 20, right: 5, bottom: 30, left: 5 };
    
        const chartWidth = svgWidth - margin.left - margin.right;
        const chartHeight = svgHeight - margin.top - margin.bottom;
    
        container.innerHTML = '';
        const svg = d3.select(container)
            .append('svg')
            .attr('width', '100%')
            .attr('height', svgHeight);
    
        let ageGroups = Object.keys(dataForHour.ageGroupsMale).filter(age => age !== '총합');
        let maleData = ageGroups.map(age => -dataForHour.ageGroupsMale[age] || 0);
        let femaleData = ageGroups.map(age => dataForHour.ageGroupsFemale[age] || 0);
    
        const data = ageGroups.map((age, i) => ({
            age,
            male: maleData[i],
            female: femaleData[i]
        }));
    
        const yScale = d3.scaleBand()
            .domain(data.map(d => d.age))
            .range([margin.top, chartHeight + margin.top])
            .padding(0.3);
    
        const xMin = d3.min(data.map(d => d.male)) || 0;
        const xMax = d3.max(data.map(d => d.female)) || 1;
    
        const xScale = d3.scaleLinear()
            .domain([xMin, xMax])
            .range([margin.left, chartWidth + margin.left])
            .nice();
    
        svg.append('text')
            .attr('x', svgWidth / 2)
            .attr('y', 20)
            .style('font-size', '14px')
            .style('font-weight', 'bold')
            .text(`${hour}시`)
            .style('text-anchor', 'middle');
    
        svg.append('g')
            .attr('transform', `translate(0,${chartHeight + margin.top})`)
            .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => Math.abs(d)))
            .selectAll('text')
            .style('font-size', '10px');

        svg.selectAll('.male-bar')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'male-bar')
            .attr('x', d => xScale(d.male))
            .attr('y', d => yScale(d.age))
            .attr('width', d => xScale(0) - xScale(d.male))
            .attr('height', yScale.bandwidth())
            .attr('fill', d => d.male === Math.min(...maleData) ? '#00008B' : '#3498DB');
    
        svg.selectAll('.female-bar')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'female-bar')
            .attr('x', xScale(0))
            .attr('y', d => yScale(d.age))
            .attr('width', d => xScale(d.female) - xScale(0))
            .attr('height', yScale.bandwidth())
            .attr('fill', d => d.female === Math.max(...femaleData) ? '#FF69B4' : '#E74C3C');
            
        svg.selectAll('.age-label')
            .data(data)
            .enter()
            .append('text')
            .attr('class', 'age-label')
            .attr('x', xScale(0))
            .attr('y', d => yScale(d.age) + yScale.bandwidth() / 1.5)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .text(d => d.age);
    }   
}
