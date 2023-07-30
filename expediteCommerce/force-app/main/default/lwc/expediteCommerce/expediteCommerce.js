import { LightningElement } from 'lwc';
import {
    lineItemData,
    summaryYears,
    summaryMonths,
    monthNames
  } from "./expediteCommerceUtil.js";

import myResource from '@salesforce/resourceUrl/expediteCommereceLogo';
import backImage from '@salesforce/resourceUrl/expediteCommereceBI';
import lineImage from '@salesforce/resourceUrl/expediteCommereceLine';
import viewButton from '@salesforce/resourceUrl/expediteCommereceButton';


export default class ExpediteCommerce extends LightningElement {
    lineItemData = [];
    flexiHeader = [];
    years = [];
    months = [];
    imageUrl;
    backImage;
    lineUrl;
    viewButtonUrl;
    currentView = 'year';
    connectedCallback(){
        const linedataList = [];
        const years = new Set();
        const month = new Set();
        const monthNameList = new Set();
        const yearSummaryMap = new Map();
        const monthSummaryMap = new Map();
        let yearAndAmount = new Map();
        let monthAndAmount = new Map();
        this.imageUrl = myResource;
        this.backImageUrl = backImage;
        this.lineUrl = lineImage;
        this.viewButtonUrl = viewButton;
        summaryYears.responseData.yearsData.forEach(function(value, i){
            if(yearSummaryMap.has('Summary')){
                let oldMap = yearSummaryMap.get('Summary');
                oldMap.set(value.year , value.summaryAmount);
                yearSummaryMap.set('Summary' , oldMap);
            }
            else{
                yearSummaryMap.set('Summary' , yearAndAmount.set(value.year , value.summaryAmount));
            }
            value.lineData.forEach(function(linedataValue, i){
                yearAndAmount = new Map();
                years.add(value.year);
                if(yearSummaryMap.has(linedataValue.recordId)){
                    let oldMap = yearSummaryMap.get(linedataValue.recordId);
                    oldMap.set(value.year , linedataValue.amount);
                    yearSummaryMap.set(linedataValue.recordId , oldMap);
                }
                else{
                    yearSummaryMap.set(linedataValue.recordId , yearAndAmount.set(value.year , linedataValue.amount));
                }
            });
        })

        let startMonth = summaryMonths.responseData.startMonth;
        let year = summaryMonths.responseData.startYear;
        summaryMonths.responseData.summaryAmount.forEach(function(amountvalue, i){
            if(monthSummaryMap.has('Summary')){
                let oldMap = monthSummaryMap.get('Summary');
                oldMap.set(year + ':' + startMonth , amountvalue);
                monthSummaryMap.set('Summary' , oldMap);
            }
            else{
                monthSummaryMap.set('Summary' , monthAndAmount.set(year + ':' + startMonth , amountvalue));
            }
            month.add(year + ':' + startMonth);
            startMonth ++;
            if(startMonth > 12){
                startMonth = 1;
                year++;
            }
        });

        summaryMonths.responseData.linesData.forEach(function(linevalue, i){
            startMonth = linevalue.startMonth;
            year = linevalue.startYear;
            monthAndAmount = new Map();
            linevalue.data.forEach(function(amount, i){
                if(monthSummaryMap.has(linevalue.recordId)){
                    let oldMap = monthSummaryMap.get(linevalue.recordId);
                    oldMap.set(year + ':' + startMonth , amount);
                    monthSummaryMap.set(linevalue.recordId , oldMap);
                }
                else{
                    monthSummaryMap.set(linevalue.recordId , monthAndAmount.set(year + ':' + startMonth , amount));
                }
                month.add(year + ':' + startMonth);
                startMonth ++;
                if(startMonth > 12){
                    startMonth = 1;
                    year++;
                }
            })
        })
        lineItemData.push({'productFLIId' : 'Summary'});
        lineItemData.forEach(function(value, i) {
            const linedata = {};
            linedata.productId = value.productFLIId;
            linedata.productItemName = value.productItemName;
            linedata.optionItemName = value.optionItemName;
            linedata.attributes = value.attributes;
            linedata.revenueType = value.revenueType;
            linedata.qty = value.qty;
            linedata.unitPrice = value.unitPrice;
            linedata.startMonth = value.startMonth;
            linedata.months = value.months;
            linedata.revenueRecognitionName = value.revenueRecognitionName;
            linedata.committed = value.committed;
            linedata.renderData = [];
            linedata.yearSummary = [];
            linedata.monthSummary = [];
            years.forEach(function(year , i){
                if(yearSummaryMap.get(linedata.productId).has(year)){
                    let oldMap = yearSummaryMap.get(linedata.productId);
                    let amount = oldMap.get(year);
                    linedata.yearSummary.push({'year' : year , 'amount' : amount});
                }
                else{
                    linedata.yearSummary.push({'year' : year , 'amount' : '-'});
                }
            })
        
            month.forEach(function(month , i){
                if(monthSummaryMap.get(linedata.productId).has(month)){
                    let oldMap = monthSummaryMap.get(linedata.productId);
                    let amount = oldMap.get(month);
                    linedata.monthSummary.push({'month' : month , 'amount' : amount});
                }
                else{
                    linedata.monthSummary.push({'month' : month , 'amount' : '-'});
                }
                let monthName = monthNames[parseInt(month.split(':')[1]) - 1] + ' ' + month.split(':')[0];
                monthNameList.add(monthName);
            })
            linedata.renderData = linedata.yearSummary;
            linedataList.push(linedata);
        });
        
        this.lineItemData = linedataList;
        this.years = years;
        this.months = monthNameList;
        this.flexiHeader = this.years;
        console.log(linedataList);
    }

    HandleSummaryClick(event){
        var element = this.template.querySelector(".dropdown-content").classList.add('DisplayNone');
        if(this.currentView == 'year'){
            this.currentView = 'month';
            this.flexiHeader = this.months;
        }
        else{
            this.currentView = 'year';
            this.flexiHeader = this.years;
        }
        let currentView = this.currentView;
        this.lineItemData.forEach(function(value, i) {
            if(currentView == 'year'){
                value.renderData = value.yearSummary;
            }
            else{
                value.renderData = value.monthSummary;
            }
        })
    }
}