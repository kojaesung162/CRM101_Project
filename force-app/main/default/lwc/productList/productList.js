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
    @track hasProductBeenSelected = false; // 🔥 한 번이라도 제품을 선택했는지 여부
    @track isKnowledgeHidden = true; // 🔥 처음에는 hidden 상태

    connectedCallback() {
        const params = new URLSearchParams(window.location.search);
        this.accountId = params.get('accountId') || ''; 
        console.log('Extracted Account ID:', this.accountId);

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
                console.log(ProductImage);
                console.log('Loaded Products:', this.products);

            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    }

    handleProductSelection(event) {
        // 🔹 선택된 제품 가져오기
        this.selectedProductId = event.currentTarget.dataset.id;
        const selectedProduct = this.products.find(product => product.id === this.selectedProductId);
        this.selectedProductName = selectedProduct?.name || '';
        this.selectedProductCategory = selectedProduct?.category || '';
    
        console.log('Selected ProductId:', this.selectedProductId);
        console.log('Selected Product:', this.selectedProductName);
        console.log('Selected Product Category:', this.selectedProductCategory);
    
        // 🔹 모든 제품 카드에서 'selected' 클래스 제거
        this.template.querySelectorAll('.product-card').forEach(card => {
            card.classList.remove('selected');
        });
    
        // 🔹 현재 선택된 제품 카드에 'selected' 클래스 추가
        event.currentTarget.classList.add('selected');

        
    
        // 🔹 LMS 메시지 발행 (선택된 제품 정보 전송)
        const message = {
            accountId: this.accountId,
            productId: this.selectedProductId,
            productName: this.selectedProductName,
            productCategory: this.selectedProductCategory,
            progressValue: 66  
        };
        publish(this.messageContext, PRODUCT_MESSAGE, message);
    
        // 🔹 애니메이션 동작
        this.productListMoved = true;
    
        // 🔥 문구를 한 번만 표시하고 이후에는 숨김
        if (!this.hasProductBeenSelected) {
            this.isTextVisible = true;
        }
        this.hasProductBeenSelected = true;
    
        setTimeout(() => {
            const textElement = this.template.querySelector('.fade-in-text');
            if (textElement) {
                textElement.scrollIntoView({ behavior: 'smooth' });
            }
    
            // 🔽 1.5초 후 문구 사라짐
            setTimeout(() => {
                this.isTextVisible = false;
    
                // 🔽 0.5초 후 KnowledgeSearch의 hidden 속성 해제
                setTimeout(() => {
                    this.isKnowledgeHidden = false; // ✅ `hidden` 해제하여 표시
                }, 500);
            }, 1500);
        }, 700);
    }
}