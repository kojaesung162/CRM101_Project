import { LightningElement, track, wire } from 'lwc';
import { publish, MessageContext } from 'lightning/messageService';
import PRODUCT_MESSAGE from '@salesforce/messageChannel/ProductMessageChannel__c';
import getProductsByAccount from '@salesforce/apex/ProductFetcher.getProductsByAccount';
import getAccountName from '@salesforce/apex/GetAccount.getAccount';
import ProductImage from '@salesforce/resourceUrl/Productimage';

export default class ProductList extends LightningElement {
    @track accountId = '';
    @track products = [];
    @track selectedProductId = '';
    @track selectedProductName = '';
    @track selectedProductCategory = '';
    @track accountName = "";
    
    @wire(MessageContext) messageContext;

    @track productListMoved = false;
    @track isTextVisible = false;
    @track hasProductBeenSelected = false; 
    @track isKnowledgeHidden = true; 

    connectedCallback() {
        const params = new URLSearchParams(window.location.search);
        this.accountId = params.get('accountId') || ''; 
        
        if (this.accountId) {
            this.loadProducts();
        }
    }

    @wire(getAccountName, { accountId: '$accountId' })
    wiredAccount({ error, data }) {
        if (data) {
            this.accountName += " "+data.Name+"님이 구매한 제품";
        } else if (error) {
            console.error('Error fetching Account Name:', error);
        }
    }

    get productListClass() {
        return this.productListMoved ? 'product-list-wrapper move-up' : 'product-list-wrapper';
    }

    get fadeInTextClass() {
        return this.isTextVisible ? 'fade-in-text show' : 'fade-in-text';
    }

    get knowledgeClass() {
        return this.isKnowledgeHidden ? 'knowledge-container hidden' : 'knowledge-container show';
    }

    async loadProducts() {
        try {
            const data = await getProductsByAccount({ accountId: this.accountId });
            if (data) {
                this.products = data.map(item => ({
                    id: item.productId,
                    name: item.name,
                    category: item.category,  
                    totalQuantity: item.totalQuantity,
                    totalRevenue: item.totalRevenue,
                    imageUrl: ProductImage+'/'+encodeURIComponent(item.name)+'.png'
                }));
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    }

    handleProductSelection(event) {
        this.selectedProductId = event.currentTarget.dataset.id;
        const selectedProduct = this.products.find(product => product.id === this.selectedProductId);
        this.selectedProductName = selectedProduct?.name || '';
        this.selectedProductCategory = selectedProduct?.category || '';

        this.template.querySelectorAll('.product-card').forEach(card => {
            card.classList.remove('selected');
        });
    
        event.currentTarget.classList.add('selected');

        const message = {
            accountId: this.accountId,
            productId: this.selectedProductId,
            productName: this.selectedProductName,
            productCategory: this.selectedProductCategory,
            progressValue: 66  
        };
        publish(this.messageContext, PRODUCT_MESSAGE, message);
        this.productListMoved = true;

        if (!this.hasProductBeenSelected) {
            this.isTextVisible = true;
        }
        this.hasProductBeenSelected = true;
    
        setTimeout(() => {
            const textElement = this.template.querySelector('.fade-in-text');
            if (textElement) {
                textElement.scrollIntoView({ behavior: 'smooth' });
            }
    
            setTimeout(() => {
                this.isTextVisible = false;
                setTimeout(() => {
                    this.isKnowledgeHidden = false; 
                }, 500);
            }, 1500);
        }, 700);
    }
}