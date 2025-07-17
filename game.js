let gameState = {
    treeGrowth: 0,
    money: 0,
    incomeRate: 500,
    growthRate: 1,
    lastUpdate: Date.now(),
    lastIncomeTime: Date.now(),
    storyProgress: 0,
    treeStage: 0
};

let particles = [];
let particleEffectsEnabled = false;

let treeGrowthElement, moneyElement, incomeRateElement, growthRateElement, storyTextElement, shopItemsElement;
let treeSvg, trunkElement, branchesGroup, leavesGroup, fruitsGroup, lightEffectsGroup, seedElement;
let canvas, ctx;
let purchaseSound, growthSound, storySound;
let soundEnabled = true;

const treeStages = [
    { growth: 0, name: "씨앗" },
    { growth: 100, name: "새싹" },
    { growth: 500, name: "묘목" },
    { growth: 1000, name: "어린 나무" },
    { growth: 2000, name: "성장한 나무" },
    { growth: 5000, name: "큰 나무" },
    { growth: 10000, name: "열매 맺는 나무" },
    { growth: 20000, name: "빛나는 나무" },
    { growth: 50000, name: "마을의 명소" },
    { growth: 100000, name: "신비한 나무" },
    { growth: 200000, name: "완성된 나무" }
];

// 상점 아이템 정의
const shopItems = [
    // 기본 아이템
    {
        id: 'water',
        name: '물뿌리개',
        description: '나무 성장 속도 +1',
        basePrice: 500,
        price: 500,
        priceMultiplier: 1.2,
        effect: () => { gameState.growthRate += 1; },
        maxQuantity: 5,
        quantity: 0,
        category: '성장'
    },
    {
        id: 'fertilizer',
        name: '비료',
        description: '나무 성장 속도 +3',
        basePrice: 1500,
        price: 1500,
        priceMultiplier: 1.3,
        effect: () => { gameState.growthRate += 3; },
        maxQuantity: 3,
        quantity: 0,
        category: '성장'
    },
    {
        id: 'part_time',
        name: '아르바이트',
        description: '분당 수입 +500원',
        basePrice: 1000,
        price: 1000,
        priceMultiplier: 1.25,
        effect: () => { gameState.incomeRate += 500; },
        maxQuantity: 5,
        quantity: 0,
        category: '수입'
    },
    {
        id: 'investment',
        name: '주식 투자',
        description: '분당 수입 +2000원',
        basePrice: 5000,
        price: 5000,
        priceMultiplier: 1.4,
        effect: () => { gameState.incomeRate += 2000; },
        maxQuantity: 3,
        quantity: 0,
        category: '수입'
    },
    {
        id: 'auto_watering',
        name: '자동 급수 시스템',
        description: '나무 성장 속도 +10',
        basePrice: 10000,
        price: 10000,
        priceMultiplier: 1.5,
        effect: () => { gameState.growthRate += 10; },
        maxQuantity: 1,
        quantity: 0,
        category: '성장'
    },
    {
        id: 'magic_fertilizer',
        name: '마법의 비료',
        description: '나무 성장 속도 +20, 특별한 효과 발생',
        basePrice: 20000,
        price: 20000,
        priceMultiplier: 2.0,
        effect: () => {
            gameState.growthRate += 20;
            enableParticleEffects();
        },
        maxQuantity: 1,
        quantity: 0,
        category: '성장'
    },

    // 새로운 업그레이드 아이템
    {
        id: 'weather_forecast',
        name: '일기 예보',
        description: '날씨 변화를 미리 알 수 있어 날씨 효과가 10% 증가합니다.',
        basePrice: 3000,
        price: 3000,
        priceMultiplier: 1.3,
        effect: () => {
            gameState.weatherEffectBonus = (gameState.weatherEffectBonus || 0) + 0.1;
            alert('이제 날씨 효과가 10% 증가합니다!');
        },
        maxQuantity: 3,
        quantity: 0,
        category: '날씨'
    },
    {
        id: 'greenhouse',
        name: '온실',
        description: '나쁜 날씨의 영향을 50% 줄입니다.',
        basePrice: 8000,
        price: 8000,
        priceMultiplier: 1.8,
        effect: () => {
            gameState.badWeatherResistance = (gameState.badWeatherResistance || 0) + 0.5;
            alert('이제 나쁜 날씨의 영향이 50% 줄어듭니다!');
        },
        maxQuantity: 1,
        quantity: 0,
        category: '날씨'
    },
    {
        id: 'rain_collector',
        name: '빗물 수집기',
        description: '비가 올 때 성장 효과가 추가로 20% 증가합니다.',
        basePrice: 6000,
        price: 6000,
        priceMultiplier: 1.4,
        effect: () => {
            gameState.rainEffectBonus = (gameState.rainEffectBonus || 0) + 0.2;
            alert('이제 비가 올 때 성장 효과가 추가로 20% 증가합니다!');
        },
        maxQuantity: 2,
        quantity: 0,
        category: '날씨'
    },
    {
        id: 'tree_fence',
        name: '나무 울타리',
        description: '랜덤 이벤트 중 나쁜 이벤트 확률이 50% 감소합니다.',
        basePrice: 7500,
        price: 7500,
        priceMultiplier: 1.6,
        effect: () => {
            gameState.badEventResistance = (gameState.badEventResistance || 0) + 0.5;
            alert('이제 나쁜 이벤트 확률이 50% 감소합니다!');
        },
        maxQuantity: 1,
        quantity: 0,
        category: '이벤트'
    },
    {
        id: 'event_charm',
        name: '행운의 부적',
        description: '좋은 이벤트 확률이 30% 증가합니다.',
        basePrice: 12000,
        price: 12000,
        priceMultiplier: 1.5,
        effect: () => {
            gameState.goodEventChance = (gameState.goodEventChance || 0) + 0.3;
            alert('이제 좋은 이벤트 확률이 30% 증가합니다!');
        },
        maxQuantity: 2,
        quantity: 0,
        category: '이벤트'
    },
    {
        id: 'soil_improvement',
        name: '토양 개량제',
        description: '나무 성장 속도 +5, 모든 비료 효과 20% 증가',
        basePrice: 15000,
        price: 15000,
        priceMultiplier: 1.6,
        effect: () => {
            gameState.growthRate += 5;
            gameState.fertilizerBonus = (gameState.fertilizerBonus || 0) + 0.2;
            alert('토양이 개량되어 성장 속도가 증가하고 비료 효과가 20% 증가합니다!');
        },
        maxQuantity: 2,
        quantity: 0,
        category: '성장'
    },
    {
        id: 'tourist_attraction',
        name: '관광 명소화',
        description: '나무를 관광 명소로 홍보하여 분당 수입 +3000원',
        basePrice: 25000,
        price: 25000,
        priceMultiplier: 1.7,
        effect: () => {
            gameState.incomeRate += 3000;
            alert('나무가 관광 명소가 되어 수입이 크게 증가했습니다!');
        },
        maxQuantity: 2,
        quantity: 0,
        category: '수입'
    },
    {
        id: 'research_lab',
        name: '연구소',
        description: '나무 연구소를 설립하여 성장 속도 +15, 분당 수입 +1500원',
        basePrice: 50000,
        price: 50000,
        priceMultiplier: 2.5,
        effect: () => {
            gameState.growthRate += 15;
            gameState.incomeRate += 1500;
            alert('나무 연구소가 설립되어 성장 속도와 수입이 모두 증가했습니다!');
        },
        maxQuantity: 1,
        quantity: 0,
        category: '특별'
    }
];

// 스토리 이벤트 정의
const storyEvents = [
    { growth: 100, text: '작은 새싹이 땅을 뚫고 올라왔습니다. 할아버지가 주신 씨앗이 드디어 싹을 틔웠습니다.' },
    { growth: 500, text: '새싹이 자라 작은 묘목이 되었습니다. 푸른 잎이 몇 개 나타났습니다.' },
    { growth: 1000, text: '묘목이 점점 자라고 있습니다. 이 나무는 일반적인 나무와는 조금 다른 것 같습니다.' },
    { growth: 2000, text: '나무가 무럭무럭 자라고 있습니다. 가끔씩 이상한 빛을 발하는 것 같기도 합니다.' },
    { growth: 5000, text: '나무가 상당히 커졌습니다. 이제는 창문 밖에서도 보일 정도입니다. 이웃들이 이 특이한 나무에 관심을 보입니다.' },
    { growth: 10000, text: '나무에서 작은 열매가 맺히기 시작했습니다. 할아버지가 이 나무를 키우라고 하신 이유가 궁금해집니다.' },
    { growth: 20000, text: '나무가 거대해졌습니다. 열매에서는 은은한 빛이 납니다. 이 나무의 비밀이 점점 드러나고 있습니다.' },
    { growth: 50000, text: '나무가 마을의 명소가 되었습니다. 많은 사람들이 이 신비한 나무를 보기 위해 찾아옵니다.' },
    { growth: 100000, text: '어느 날 밤, 나무에서 강한 빛이 뿜어져 나왔습니다. 그리고 할아버지의 목소리가 들려옵니다: "잘 키워줘서 고맙구나. 이제 거의 다 왔어..."' },
    { growth: 200000, text: '나무가 완전히 성장했습니다! 나무 주변에 신비한 문이 나타났습니다. 할아버지가 남기신 메시지: "이 문을 통해 새로운 세계로 갈 수 있단다. 내가 너를 기다리고 있을게."' }
];

// 파티클 클래스
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 5 + 1;
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 - 1.5;
        this.color = `hsl(${Math.random() * 60 + 30}, 100%, 50%)`;
        this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.005;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.alpha -= this.decay;
        if (this.alpha < 0) this.alpha = 0;
    }

    draw() {
        if (!ctx) return;

        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// 파티클 효과 활성화
function enableParticleEffects() {
    particleEffectsEnabled = true;
}

// 파티클 생성
function createParticles() {
    if (!particleEffectsEnabled || !canvas || !ctx || !treeSvg || !trunkElement) return;

    try {
        // 나무 위치 계산
        const treeX = 150; // SVG 좌표계 기준
        let treeY = 320; // 기본값

        // trunkElement가 있으면 실제 위치 사용
        if (trunkElement && trunkElement.y && trunkElement.y.baseVal) {
            treeY = trunkElement.y.baseVal.value;
        }

        // 캔버스 좌표계로 변환
        const x = (treeX / 300) * canvas.width;
        const y = (treeY / 400) * canvas.height;

        // 파티클 생성
        if (Math.random() < 0.3 && particles.length < 50) {
            particles.push(new Particle(x, y));
        }

        // 파티클 업데이트 및 그리기
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();

            if (particles[i].alpha <= 0) {
                particles.splice(i, 1);
                i--;
            }
        }
    } catch (error) {
        console.error("파티클 생성 중 오류:", error);
    }
}



// 자동 새로고침 함수 - 돈이 충분할 때 상점을 자동으로 새로고침
function autoRefreshShop() {
    // 구매 가능한 아이템이 있는지 확인
    const purchasableItem = shopItems.find(item =>
        item.quantity < item.maxQuantity && gameState.money >= item.price
    );

    // 구매 가능한 아이템이 있으면 상점 새로고침
    if (purchasableItem) {
        renderShop();
        return true;
    }

    return false;
}

// 상점 아이템 렌더링
function renderShop() {
    if (!shopItemsElement) {
        console.error('상점 요소를 찾을 수 없습니다.');
        return;
    }

    console.log('상점 렌더링 시작');
    shopItemsElement.innerHTML = '';

    // 카테고리 버튼 추가
    const categories = ['전체', '성장', '수입', '날씨', '이벤트', '특별'];
    const shopHeader = document.createElement('div');
    shopHeader.className = 'shop-categories';

    categories.forEach(category => {
        const categoryBtn = document.createElement('button');
        categoryBtn.className = 'category-btn';
        categoryBtn.textContent = category;
        categoryBtn.setAttribute('data-category', category);

        // 카테고리 버튼 클릭 이벤트
        categoryBtn.addEventListener('click', function () {
            // 모든 버튼에서 active 클래스 제거
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.classList.remove('active');
            });

            // 현재 버튼에 active 클래스 추가
            this.classList.add('active');

            // 아이템 필터링
            const selectedCategory = this.getAttribute('data-category');
            filterShopItems(selectedCategory);
        });

        shopHeader.appendChild(categoryBtn);
    });

    // 기본적으로 '전체' 카테고리 선택
    shopHeader.querySelector('[data-category="전체"]').classList.add('active');

    shopItemsElement.appendChild(shopHeader);

    // 아이템 컨테이너 생성
    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'shop-items-container';
    shopItemsElement.appendChild(itemsContainer);

    // 모든 아이템 렌더링
    renderShopItems(itemsContainer, shopItems);

    console.log('상점 렌더링 완료');
}

// 상점 아이템 필터링 함수
function filterShopItems(category) {
    const itemsContainer = document.querySelector('.shop-items-container');
    if (!itemsContainer) return;

    itemsContainer.innerHTML = '';

    if (category === '전체') {
        renderShopItems(itemsContainer, shopItems);
    } else {
        const filteredItems = shopItems.filter(item => item.category === category);
        renderShopItems(itemsContainer, filteredItems);
    }
}

// 상점 아이템 렌더링 함수
function renderShopItems(container, items) {
    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'shop-item';
        itemElement.setAttribute('data-category', item.category || '기타');

        const disabled = item.quantity >= item.maxQuantity || gameState.money < item.price;
        const maxReached = item.quantity >= item.maxQuantity;
        const affordable = gameState.money >= item.price;

        // 추가 클래스 설정
        if (maxReached) {
            itemElement.classList.add('max-reached');
        } else if (affordable) {
            itemElement.classList.add('affordable');
        } else {
            itemElement.classList.add('not-affordable');
        }

        // 특별 아이템 스타일 적용
        if (item.category === '특별') {
            itemElement.classList.add('special-item');
        }

        console.log(`아이템 렌더링: ${item.name}, 가격: ${item.price}, 보유금액: ${gameState.money}, 비활성화: ${disabled}`);

        // 수량 배지 추가 (구매한 아이템이 있을 경우)
        if (item.quantity > 0) {
            const quantityBadge = document.createElement('div');
            quantityBadge.className = 'quantity-badge';
            if (item.quantity === item.maxQuantity) {
                quantityBadge.classList.add('max-quantity');
            }
            quantityBadge.textContent = item.quantity;
            itemElement.appendChild(quantityBadge);
        }

        // 아이템 헤더 영역 (배경색 있는 상단 부분)
        const itemHeader = document.createElement('div');
        itemHeader.className = 'item-header';

        // 카테고리 표시 (상단 우측 모서리)
        const categoryIndicator = document.createElement('div');
        categoryIndicator.className = 'category-indicator';

        // 카테고리에 따라 다른 아이콘 표시
        let categoryIcon = '';
        switch (item.category) {
            case '성장':
                categoryIcon = '🌱';
                break;
            case '수입':
                categoryIcon = '💰';
                break;
            case '날씨':
                categoryIcon = '☁️';
                break;
            case '이벤트':
                categoryIcon = '🎉';
                break;
            case '특별':
                categoryIcon = '✨';
                break;
            default:
                categoryIcon = '🔍';
        }

        categoryIndicator.textContent = categoryIcon;
        itemHeader.appendChild(categoryIndicator);

        // 제목
        const title = document.createElement('h3');
        title.textContent = item.name;
        itemHeader.appendChild(title);

        itemElement.appendChild(itemHeader);

        // 아이템 내용 생성 - 수평 레이아웃
        const itemContent = document.createElement('div');
        itemContent.className = 'item-content';

        // 효과 설명 (아이콘 + 텍스트)
        const effectBox = document.createElement('div');
        effectBox.className = 'effect-box';

        // 효과 설명 텍스트
        const description = document.createElement('p');
        description.className = 'description';
        description.textContent = item.description;
        effectBox.appendChild(description);

        itemContent.appendChild(effectBox);

        // 가격 및 수량 정보 컨테이너
        const priceContainer = document.createElement('div');
        priceContainer.className = 'price-container';

        // 가격
        const price = document.createElement('span');
        price.className = 'price';
        price.textContent = `${item.price.toLocaleString()}원`;
        priceContainer.appendChild(price);

        // 수량 정보
        const quantityInfo = document.createElement('span');
        quantityInfo.className = 'quantity-info';
        quantityInfo.textContent = `${item.quantity}/${item.maxQuantity}`;
        priceContainer.appendChild(quantityInfo);

        itemContent.appendChild(priceContainer);

        itemElement.appendChild(itemContent);

        // 구매 버튼
        const buyButton = document.createElement('button');
        buyButton.className = 'buy-button';

        if (maxReached) {
            buyButton.innerHTML = '<span>최대 구매</span>';
        } else if (affordable) {
            buyButton.innerHTML = '<span>구매하기</span>';
        } else {
            buyButton.innerHTML = '<span>돈 부족</span>';
        }

        buyButton.setAttribute('data-item-id', item.id);

        if (disabled) {
            buyButton.disabled = true;
        } else {
            // 버튼에 직접 클릭 이벤트 추가
            buyButton.addEventListener('click', function () {
                console.log(`버튼 클릭됨: ${item.id}`);
                purchaseItem(item.id);
            });
        }

        itemElement.appendChild(buyButton);
        container.appendChild(itemElement);
    });

    console.log('상점 렌더링 완료');
}

// 아이템 구매 함수
function purchaseItem(itemId) {
    console.log(`아이템 구매 시도: ${itemId}`);

    const item = shopItems.find(item => item.id === itemId);

    if (!item) {
        console.error(`아이템을 찾을 수 없음: ${itemId}`);
        return;
    }

    console.log(`아이템 정보: ${item.name}, 가격: ${item.price}, 현재 수량: ${item.quantity}, 최대 수량: ${item.maxQuantity}`);
    console.log(`현재 보유 금액: ${gameState.money}`);

    if (item.quantity >= item.maxQuantity) {
        console.error(`최대 수량에 도달함: ${item.name}`);
        return;
    }

    if (gameState.money < item.price) {
        console.error(`돈이 부족함: 필요 ${item.price}, 보유 ${gameState.money}`);
        return;
    }

    console.log(`구매 성공: ${item.name}`);
    gameState.money -= item.price;
    item.quantity += 1;

    console.log(`효과 적용 전: 성장률 ${gameState.growthRate}, 수입률 ${gameState.incomeRate}`);
    item.effect();
    console.log(`효과 적용 후: 성장률 ${gameState.growthRate}, 수입률 ${gameState.incomeRate}`);

    // 가격 증가 (priceMultiplier 적용)
    item.price = Math.floor(item.price * item.priceMultiplier);

    // 구매 효과 애니메이션
    showPurchaseEffect();

    // 사운드 재생
    playSound(purchaseSound);

    // UI 업데이트
    updateUI();

    // 상점 다시 렌더링
    renderShop();

    console.log(`구매 완료: ${item.name}, 남은 금액: ${gameState.money}, 다음 가격: ${item.price}`);
}

// 구매 효과 애니메이션
function showPurchaseEffect() {
    const effect = document.createElement('div');
    effect.className = 'purchase-effect';
    effect.textContent = '구매 완료!';
    document.body.appendChild(effect);

    setTimeout(() => {
        effect.remove();
    }, 1500);
}

// 사운드 재생 함수
function playSound(sound) {
    if (!soundEnabled || !sound) return;

    try {
        sound.currentTime = 0;
        sound.play().catch(error => {
            console.error("사운드 재생 오류:", error);
        });
    } catch (error) {
        console.error("사운드 재생 중 오류:", error);
    }
}
// 나무 SVG 업데이트
function updateTreeSVG() {
    if (!treeSvg || !trunkElement) return;

    const growth = gameState.treeGrowth;

    // 현재 나무 단계 확인
    let currentStage = 0;
    for (let i = 0; i < treeStages.length; i++) {
        if (growth >= treeStages[i].growth) {
            currentStage = i;
        } else {
            break;
        }
    }

    // 단계가 변경되었을 때만 나무 모양 업데이트
    if (currentStage !== gameState.treeStage) {
        gameState.treeStage = currentStage;
        updateTreeAppearance(currentStage);
    }

    // 나무 크기 및 위치 업데이트 (단계와 상관없이 지속적으로 변화)
    updateTreeSize(growth);
}

// 나무 모양 업데이트 (단계별) - 자연스러운 성장 개선
function updateTreeAppearance(stage) {
    if (!seedElement || !trunkElement || !branchesGroup || !leavesGroup || !fruitsGroup || !lightEffectsGroup) return;

    // 씨앗 표시 여부
    seedElement.style.display = stage === 0 ? 'block' : 'none';

    // 줄기 표시 여부
    trunkElement.style.display = stage > 0 ? 'block' : 'none';

    // 단계별 나무 모양 변경
    clearTreeElements();

    switch (stage) {
        case 0: // 씨앗
            // 씨앗에서 뿌리가 나오는 효과
            const roots = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            roots.innerHTML = `
                <path d="M 150,380 L 145,385 L 140,390" stroke="#5D4037" stroke-width="1" fill="none" />
                <path d="M 150,380 L 155,385 L 160,390" stroke="#5D4037" stroke-width="1" fill="none" />
                <path d="M 150,380 L 150,385 L 150,390" stroke="#5D4037" stroke-width="1" fill="none" />
            `;
            branchesGroup.appendChild(roots);
            break;

        case 1: // 새싹
            // 작은 새싹 효과
            createPolygonLeaf(150, 310, 10, '#81c784');

            // 뿌리 효과 추가
            const seedlingRoots = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            seedlingRoots.innerHTML = `
                <path d="M 150,380 Q 140,385 130,390" stroke="#5D4037" stroke-width="1.5" fill="none" />
                <path d="M 150,380 Q 160,385 170,390" stroke="#5D4037" stroke-width="1.5" fill="none" />
                <path d="M 150,380 Q 145,385 140,395" stroke="#5D4037" stroke-width="1.5" fill="none" />
                <path d="M 150,380 Q 155,385 160,395" stroke="#5D4037" stroke-width="1.5" fill="none" />
            `;
            branchesGroup.appendChild(seedlingRoots);

            playSound(growthSound);
            break;

        case 2: // 묘목
            // 여러 잎을 가진 묘목
            createLeafCluster(150, 300, 5);

            // 작은 줄기 효과
            const smallStem = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            smallStem.setAttribute('d', 'M 150,320 Q 148,310 150,300');
            smallStem.setAttribute('stroke', '#8D6E63');
            smallStem.setAttribute('stroke-width', '3');
            smallStem.setAttribute('fill', 'none');
            branchesGroup.appendChild(smallStem);

            playSound(growthSound);
            break;

        case 3: // 어린 나무
            // 곡선 가지 추가
            updateBranches(2);
            updateLeaves(8);

            // 뿌리 효과 추가
            addRoots(3);

            playSound(growthSound);
            break;

        case 4: // 성장한 나무
            updateBranches(4);
            updateLeaves(15);
            addRoots(5);

            // 작은 꽃 추가
            if (Math.random() > 0.5) {
                addFlowers(3);
            }

            playSound(growthSound);
            break;

        case 5: // 큰 나무
            updateBranches(6);
            updateLeaves(25);
            addRoots(7);
            addFlowers(5);

            playSound(growthSound);
            break;

        case 6: // 열매 맺는 나무
            updateBranches(8);
            updateLeaves(35);
            addFruits(8);
            addRoots(8);
            addFlowers(8);

            // 새 추가
            addBirds(2);

            playSound(growthSound);
            break;

        case 7: // 빛나는 나무
            updateBranches(10);
            updateLeaves(45);
            addFruits(12);
            addLightEffects(5);
            addRoots(10);
            addFlowers(10);
            addBirds(3);

            // 나비 추가
            addButterflies(3);

            playSound(growthSound);
            break;

        case 8: // 마을의 명소
            updateBranches(14);
            updateLeaves(55);
            addFruits(18);
            addLightEffects(8);
            addRoots(12);
            addFlowers(15);
            addBirds(4);
            addButterflies(5);

            // 무지개 효과
            addRainbow();

            playSound(growthSound);
            break;

        case 9: // 신비한 나무
            updateBranches(18);
            updateLeaves(70);
            addFruits(25);
            addLightEffects(12);
            addRoots(15);
            addFlowers(20);
            addBirds(5);
            addButterflies(8);
            addRainbow();

            // 별 효과
            addStars(15);

            playSound(growthSound);
            break;

        case 10: // 완성된 나무
            updateBranches(25);
            updateLeaves(100);
            addFruits(35);
            addLightEffects(25);
            addRoots(20);
            addFlowers(30);
            addBirds(8);
            addButterflies(12);
            addRainbow();
            addStars(30);
            addPortal();

            // 오라 효과
            addAura();

            playSound(growthSound);
            break;
    }
}
// 나무 요소 초기화
function clearTreeElements() {
    if (!branchesGroup || !leavesGroup || !fruitsGroup || !lightEffectsGroup) return;

    branchesGroup.innerHTML = '';
    leavesGroup.innerHTML = '';
    fruitsGroup.innerHTML = '';
    lightEffectsGroup.innerHTML = '';
}
// 나무 크기 업데이트
function updateTreeSize(growth) {
    if (!trunkElement) return;

    // 줄기 높이 (최대 300px)
    const maxHeight = 300;
    const minHeight = 60;
    const heightRange = maxHeight - minHeight;

    let trunkHeight;
    if (growth < 100) {
        trunkHeight = 0; // 씨앗 단계에서는 줄기 없음
    } else {
        trunkHeight = minHeight + Math.min((growth / 200000) * heightRange, heightRange);
    }

    const trunkY = 380 - trunkHeight;
    trunkElement.setAttribute('y', trunkY);
    trunkElement.setAttribute('height', trunkHeight);

    // 줄기 너비 (최대 30px)
    const trunkWidth = Math.min(10 + (growth / 50000) * 20, 30);
    const trunkX = 150 - trunkWidth / 2;
    trunkElement.setAttribute('x', trunkX);
    trunkElement.setAttribute('width', trunkWidth);

    // 성장에 따른 색상 변화
    if (growth > 100000) {
        trunkElement.setAttribute('fill', '#5d4037'); // 더 진한 갈색
    } else if (growth > 20000) {
        trunkElement.setAttribute('fill', '#6d4c41'); // 진한 갈색
    } else {
        trunkElement.setAttribute('fill', '#795548'); // 기본 갈색
    }
}

// 가지 업데이트 - 자연스러운 곡선 가지로 개선
function updateBranches(count) {
    if (!branchesGroup || !trunkElement) return;

    branchesGroup.innerHTML = '';

    const trunkX = parseFloat(trunkElement.getAttribute('x') || '145');
    const trunkWidth = parseFloat(trunkElement.getAttribute('width') || '10');
    const trunkY = parseFloat(trunkElement.getAttribute('y') || '320');
    const trunkHeight = parseFloat(trunkElement.getAttribute('height') || '60');

    const centerX = trunkX + trunkWidth / 2;

    // 메인 가지 생성
    for (let i = 0; i < count; i++) {
        const branchY = trunkY + trunkHeight * (0.2 + 0.6 * (i / count));
        const length = 20 + Math.random() * 40;
        const thickness = 3 + Math.random() * 5;
        const angle = (i % 2 === 0) ? -30 - Math.random() * 20 : 30 + Math.random() * 20;

        // 곡선 가지 생성
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

        // 가지의 끝점 계산
        const endX = centerX + length * Math.cos(angle * Math.PI / 180);
        const endY = branchY - length * Math.sin(angle * Math.PI / 180);

        // 제어점 계산 (곡선을 위한)
        const controlX = centerX + (length * 0.5) * Math.cos((angle + (angle > 0 ? -15 : 15)) * Math.PI / 180);
        const controlY = branchY - (length * 0.5) * Math.sin((angle + (angle > 0 ? 15 : -15)) * Math.PI / 180);

        // 곡선 경로 설정
        path.setAttribute('d', `M ${centerX} ${branchY} Q ${controlX} ${controlY} ${endX} ${endY}`);
        path.setAttribute('stroke', '#795548');
        path.setAttribute('stroke-width', thickness);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-linecap', 'round');

        branchesGroup.appendChild(path);

        // 작은 가지 추가 (50% 확률)
        if (Math.random() > 0.5 && length > 30) {
            const smallBranchLength = length * 0.4;
            const smallBranchThickness = thickness * 0.6;
            const smallBranchAngle = angle + (Math.random() * 30 - 15);

            const smallPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');

            // 작은 가지 시작점 (메인 가지의 중간쯤)
            const startSmallX = centerX + (length * 0.6) * Math.cos(angle * Math.PI / 180);
            const startSmallY = branchY - (length * 0.6) * Math.sin(angle * Math.PI / 180);

            // 작은 가지 끝점
            const endSmallX = startSmallX + smallBranchLength * Math.cos(smallBranchAngle * Math.PI / 180);
            const endSmallY = startSmallY - smallBranchLength * Math.sin(smallBranchAngle * Math.PI / 180);

            // 작은 가지 제어점
            const controlSmallX = startSmallX + (smallBranchLength * 0.5) * Math.cos((smallBranchAngle + (smallBranchAngle > 0 ? -10 : 10)) * Math.PI / 180);
            const controlSmallY = startSmallY - (smallBranchLength * 0.5) * Math.sin((smallBranchAngle + (smallBranchAngle > 0 ? 10 : -10)) * Math.PI / 180);

            smallPath.setAttribute('d', `M ${startSmallX} ${startSmallY} Q ${controlSmallX} ${controlSmallY} ${endSmallX} ${endSmallY}`);
            smallPath.setAttribute('stroke', '#8D6E63');
            smallPath.setAttribute('stroke-width', smallBranchThickness);
            smallPath.setAttribute('fill', 'none');
            smallPath.setAttribute('stroke-linecap', 'round');

            branchesGroup.appendChild(smallPath);
        }
    }
}

// 잎 업데이트 - 자연스러운 잎 모양으로 개선
function updateLeaves(count) {
    if (!leavesGroup || !trunkElement) return;

    leavesGroup.innerHTML = '';

    const trunkX = parseFloat(trunkElement.getAttribute('x') || '145');
    const trunkWidth = parseFloat(trunkElement.getAttribute('width') || '10');
    const trunkY = parseFloat(trunkElement.getAttribute('y') || '320');

    const centerX = trunkX + trunkWidth / 2;

    // 나무 성장도에 따라 잎 분포 조정
    const maxDistance = 30 + Math.min(100, gameState.treeGrowth / 1000);

    // 잎 그룹 생성 (가지 주변에 집중)
    const branchElements = branchesGroup.querySelectorAll('path');

    if (branchElements.length > 0) {
        // 가지가 있는 경우 가지 주변에 잎 배치
        branchElements.forEach(branch => {
            // 가지 끝점 근처에 잎 배치
            const pathLength = branch.getTotalLength();
            const endPoint = branch.getPointAtLength(pathLength * 0.8);

            // 가지 끝 주변에 잎 클러스터 생성
            const leafCount = Math.floor(count / branchElements.length);
            createLeafCluster(endPoint.x, endPoint.y, leafCount);
        });
    } else {
        // 가지가 없는 경우 줄기 주변에 잎 배치
        for (let i = 0; i < count; i++) {
            const radius = 8 + Math.random() * 12;
            const angle = Math.random() * 360;
            const distance = 20 + Math.random() * maxDistance;

            const x = centerX + distance * Math.cos(angle * Math.PI / 180);
            const y = trunkY + 50 - distance * Math.sin(angle * Math.PI / 180);

            createLeaf(x, y, radius, radius * 1.5, getLeafColor(gameState.treeGrowth));
        }
    }
}

// 잎 클러스터 생성 함수
function createLeafCluster(centerX, centerY, count) {
    const clusterRadius = 15 + Math.random() * 10;

    for (let i = 0; i < count; i++) {
        const angle = Math.random() * 360;
        const distance = Math.random() * clusterRadius;

        const x = centerX + distance * Math.cos(angle * Math.PI / 180);
        const y = centerY + distance * Math.sin(angle * Math.PI / 180);

        const leafSize = 5 + Math.random() * 10;

        // 다양한 잎 모양 생성
        if (Math.random() > 0.7) {
            // 타원형 잎
            createLeaf(x, y, leafSize, leafSize * 1.5, getLeafColor(gameState.treeGrowth));
        } else {
            // 다각형 잎
            createPolygonLeaf(x, y, leafSize, getLeafColor(gameState.treeGrowth));
        }
    }
}

// 잎 생성
function createLeaf(x, y, width, height, color) {
    if (!leavesGroup) return;

    const leaf = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    leaf.setAttribute('cx', x);
    leaf.setAttribute('cy', y);
    leaf.setAttribute('rx', width);
    leaf.setAttribute('ry', height);
    leaf.setAttribute('fill', color);
    leaf.setAttribute('class', 'leaf');

    leavesGroup.appendChild(leaf);
}

// 열매 추가

function addFruits(count) {
    if (!fruitsGroup || !leavesGroup) return;

    fruitsGroup.innerHTML = '';

    const leaves = leavesGroup.querySelectorAll('.leaf');
    if (leaves.length === 0) return;

    const leafPositions = Array.from(leaves).map(leaf => ({
        x: parseFloat(leaf.getAttribute('cx') || '0'),
        y: parseFloat(leaf.getAttribute('cy') || '0')
    }));

    // 잎 위치를 기반으로 열매 배치
    for (let i = 0; i < Math.min(count, leafPositions.length); i++) {
        const position = leafPositions[Math.floor(Math.random() * leafPositions.length)];

        const fruit = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        fruit.setAttribute('cx', position.x + (Math.random() * 10 - 5));
        fruit.setAttribute('cy', position.y + (Math.random() * 10 - 5));
        fruit.setAttribute('r', 5 + Math.random() * 3);

        // 성장에 따른 열매 색상 변화
        if (gameState.treeGrowth > 100000) {
            fruit.setAttribute('fill', '#ffd700'); // 황금색
            fruit.setAttribute('class', 'fruit golden');
        } else if (gameState.treeGrowth > 50000) {
            fruit.setAttribute('fill', '#ffeb3b'); // 노란색
            fruit.setAttribute('class', 'fruit yellow');
        } else {
            fruit.setAttribute('fill', '#ff9800'); // 주황색
            fruit.setAttribute('class', 'fruit orange');
        }

        fruitsGroup.appendChild(fruit);
    }
}

// 빛 효과 추가
function addLightEffects(count) {
    if (!lightEffectsGroup || !trunkElement) return;

    lightEffectsGroup.innerHTML = '';

    const trunkX = parseFloat(trunkElement.getAttribute('x') || '145');
    const trunkWidth = parseFloat(trunkElement.getAttribute('width') || '10');
    const trunkY = parseFloat(trunkElement.getAttribute('y') || '320');

    const centerX = trunkX + trunkWidth / 2;

    for (let i = 0; i < count; i++) {
        const radius = 3 + Math.random() * 5;
        const angle = Math.random() * 360;
        const distance = 50 + Math.random() * 100;

        const x = centerX + distance * Math.cos(angle * Math.PI / 180);
        const y = trunkY - 50 - distance * Math.sin(angle * Math.PI / 180);

        const light = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        light.setAttribute('cx', x);
        light.setAttribute('cy', y);
        light.setAttribute('r', radius);
        light.setAttribute('fill', '#fff9c4');
        light.setAttribute('class', 'light-effect');
        light.setAttribute('filter', 'url(#glow)');

        lightEffectsGroup.appendChild(light);
    }

    // 필터 정의가 없으면 추가
    if (!document.getElementById('glow')) {
        initSVGFilters();
    }
}

// 포털 추가 (최종 단계)
function addPortal() {
    if (!lightEffectsGroup || !treeSvg) return;

    const portal = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    portal.setAttribute('cx', '150');
    portal.setAttribute('cy', '300');
    portal.setAttribute('rx', '40');
    portal.setAttribute('ry', '60');
    portal.setAttribute('fill', 'url(#portal-gradient)');
    portal.setAttribute('class', 'portal');

    // 그라데이션 정의
    let defs = treeSvg.querySelector('defs');
    if (!defs) {
        defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        treeSvg.insertBefore(defs, treeSvg.firstChild);
    }

    // 이미 그라데이션이 있는지 확인
    if (!document.getElementById('portal-gradient')) {
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
        gradient.setAttribute('id', 'portal-gradient');
        gradient.setAttribute('cx', '50%');
        gradient.setAttribute('cy', '50%');
        gradient.setAttribute('r', '50%');

        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', '#ffffff');

        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '50%');
        stop2.setAttribute('stop-color', '#64b5f6');

        const stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop3.setAttribute('offset', '100%');
        stop3.setAttribute('stop-color', '#1a237e');

        gradient.appendChild(stop1);
        gradient.appendChild(stop2);
        gradient.appendChild(stop3);

        defs.appendChild(gradient);
    }

    lightEffectsGroup.appendChild(portal);
}

// 잎 색상 계산
function getLeafColor(growth) {
    if (growth > 100000) {
        return '#ffd700'; // 황금색
    } else if (growth > 50000) {
        return '#9cff9c'; // 밝은 녹색
    } else if (growth > 10000) {
        return '#66bb6a'; // 중간 녹색
    } else {
        return '#81c784'; // 기본 녹색
    }
}

// SVG 필터 초기화
function initSVGFilters() {
    if (!treeSvg) return;

    // 이미 필터가 있는지 확인
    if (document.getElementById('glow')) return;

    let defs = treeSvg.querySelector('defs');
    if (!defs) {
        defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        treeSvg.insertBefore(defs, treeSvg.firstChild);
    }

    // 빛나는 효과 필터
    const glowFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    glowFilter.setAttribute('id', 'glow');
    glowFilter.setAttribute('x', '-50%');
    glowFilter.setAttribute('y', '-50%');
    glowFilter.setAttribute('width', '200%');
    glowFilter.setAttribute('height', '200%');

    const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    feGaussianBlur.setAttribute('stdDeviation', '3');
    feGaussianBlur.setAttribute('result', 'blur');

    const feComposite = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
    feComposite.setAttribute('in', 'SourceGraphic');
    feComposite.setAttribute('in2', 'blur');
    feComposite.setAttribute('operator', 'over');

    glowFilter.appendChild(feGaussianBlur);
    glowFilter.appendChild(feComposite);
    defs.appendChild(glowFilter);
}

// 스토리 업데이트 체크
function checkStoryProgress() {
    if (!storyTextElement) return;

    for (let i = gameState.storyProgress; i < storyEvents.length; i++) {
        if (gameState.treeGrowth >= storyEvents[i].growth) {
            storyTextElement.textContent = storyEvents[i].text;
            gameState.storyProgress = i + 1;

            // 스토리 이벤트 알림 효과
            storyTextElement.classList.add('highlight');
            setTimeout(() => {
                storyTextElement.classList.remove('highlight');
            }, 3000);

            // 스토리 사운드 재생
            playSound(storySound);
        } else {
            break;
        }
    }
}

// UI 업데이트
function updateUI() {
    if (treeGrowthElement) {
        treeGrowthElement.textContent = Math.floor(gameState.treeGrowth).toLocaleString();
    }

    if (moneyElement) {
        moneyElement.textContent = Math.floor(gameState.money).toLocaleString();
    }

    if (incomeRateElement) {
        incomeRateElement.textContent = gameState.incomeRate.toLocaleString();
    }

    if (growthRateElement) {
        growthRateElement.textContent = gameState.growthRate.toLocaleString();
    }

    updateTreeSVG();
    checkStoryProgress();
}

// 게임 업데이트 루프
function gameLoop() {
    const now = Date.now();
    const deltaTime = (now - gameState.lastUpdate) / 1000; // 초 단위 경과 시간

    // 날씨 체크 및 변경
    if (now >= weatherChangeTime) {
        changeWeather();
    }

    // 랜덤 이벤트 체크
    checkRandomEvents();

    // 날씨 효과 계산
    let weatherMultiplier = currentWeather.growthMultiplier;

    // 날씨 효과 보너스 적용
    if (gameState.weatherEffectBonus && weatherMultiplier > 1) {
        weatherMultiplier += gameState.weatherEffectBonus;
    }

    // 나쁜 날씨 저항력 적용
    if (gameState.badWeatherResistance && weatherMultiplier < 1) {
        weatherMultiplier = 1 - ((1 - weatherMultiplier) * (1 - gameState.badWeatherResistance));
    }

    // 비 효과 보너스 적용
    if (gameState.rainEffectBonus && currentWeather.id === 'rainy') {
        weatherMultiplier += gameState.rainEffectBonus;
    }

    // 자원 업데이트 (날씨 효과 적용)
    gameState.treeGrowth += gameState.growthRate * weatherMultiplier * deltaTime;

    // 10초마다 한 번에 돈이 들어오도록 수정
    const incomeInterval = 10000; // 10초 (밀리초 단위)
    if (now - gameState.lastIncomeTime >= incomeInterval) {
        // 10초가 지났으면 수입 추가
        const income = gameState.incomeRate;
        gameState.money += income;
        gameState.lastIncomeTime = now;

        // 수입 알림 표시
        showIncomeNotification(income);

        // 수입이 들어올 때 자동 새로고침 실행
        autoRefreshShop();
    }

    gameState.lastUpdate = now;

    // 파티클 효과 업데이트
    createParticles();

    // 업적 체크
    checkAchievements();

    // UI 업데이트
    updateUI();

    // 수입 카운트다운 업데이트
    updateIncomeCountdown();

    // 다음 프레임 요청
    requestAnimationFrame(gameLoop);
}

// 캔버스 크기 설정
function resizeCanvas() {
    if (!canvas) return;

    const container = document.querySelector('.tree-container');
    if (container) {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
    }
}

// 게임 저장
function saveGame() {
    try {
        localStorage.setItem('treeGame', JSON.stringify({
            treeGrowth: gameState.treeGrowth,
            money: gameState.money,
            incomeRate: gameState.incomeRate,
            growthRate: gameState.growthRate,
            storyProgress: gameState.storyProgress,
            treeStage: gameState.treeStage,
            particleEffectsEnabled: particleEffectsEnabled,
            shopItems: shopItems.map(item => ({
                id: item.id,
                quantity: item.quantity
            }))
        }));
    } catch (error) {
        console.error("게임 저장 중 오류:", error);
    }
}

// 게임 불러오기
function loadGame() {
    try {
        const savedGame = localStorage.getItem('treeGame');

        if (savedGame) {
            const parsedGame = JSON.parse(savedGame);

            gameState.treeGrowth = parsedGame.treeGrowth || 0;
            gameState.money = parsedGame.money || 0;
            gameState.incomeRate = parsedGame.incomeRate || 500;
            gameState.growthRate = parsedGame.growthRate || 1;
            gameState.storyProgress = parsedGame.storyProgress || 0;
            gameState.treeStage = parsedGame.treeStage || 0;

            if (parsedGame.particleEffectsEnabled) {
                particleEffectsEnabled = true;
            }

            // 상점 아이템 상태 복원
            if (parsedGame.shopItems) {
                parsedGame.shopItems.forEach(savedItem => {
                    const item = shopItems.find(i => i.id === savedItem.id);
                    if (item) {
                        item.quantity = savedItem.quantity;
                        // 효과 재적용
                        for (let i = 0; i < savedItem.quantity; i++) {
                            item.effect();
                        }
                    }
                });
            }

            updateUI();
            renderShop();
        }
    } catch (error) {
        console.error("게임 불러오기 중 오류:", error);
    }
}

// 게임 초기화
function initGame() {
    try {
        console.log('게임 초기화 시작');

        // DOM 요소 초기화
        treeGrowthElement = document.getElementById('tree-growth');
        moneyElement = document.getElementById('money');
        incomeRateElement = document.getElementById('income-rate');
        growthRateElement = document.getElementById('growth-rate');
        storyTextElement = document.getElementById('story-text');
        shopItemsElement = document.getElementById('shop-items');

        console.log('DOM 요소 초기화 완료');

        // SVG 요소
        treeSvg = document.getElementById('tree-svg');
        trunkElement = document.getElementById('trunk');
        branchesGroup = document.getElementById('branches');
        leavesGroup = document.getElementById('leaves');
        fruitsGroup = document.getElementById('fruits');
        lightEffectsGroup = document.getElementById('light-effects');
        seedElement = document.getElementById('seed');

        console.log('SVG 요소 초기화 완료');

        // 캔버스 요소 및 컨텍스트
        canvas = document.getElementById('particle-canvas');
        if (canvas) {
            ctx = canvas.getContext('2d');
            console.log('캔버스 컨텍스트 초기화 완료');
        } else {
            console.warn('캔버스 요소를 찾을 수 없습니다');
        }

        // 사운드 초기화
        purchaseSound = document.getElementById('purchase-sound');
        growthSound = document.getElementById('growth-sound');
        storySound = document.getElementById('story-sound');

        console.log('사운드 요소 초기화 완료');

        // 사운드 볼륨 설정
        if (purchaseSound) purchaseSound.volume = 0.3;
        if (growthSound) growthSound.volume = 0.2;
        if (storySound) storySound.volume = 0.4;

        // 캔버스 크기 설정
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        console.log('캔버스 크기 설정 완료');

        // SVG 필터 초기화
        initSVGFilters();

        console.log('SVG 필터 초기화 완료');

        // 게임 상태 초기화
        gameState.lastUpdate = Date.now();

        // 로컬 스토리지에서 게임 상태 불러오기
        loadGame();
        console.log('게임 상태 로드 완료');

        // 상점 렌더링 및 이벤트 리스너 설정
        renderShop();
        console.log('상점 렌더링 완료');

        // 상점 아이템 구매 버튼에 직접 이벤트 리스너 추가
        setupShopItemListeners();

        // 업적 및 설정 버튼 이벤트 리스너 설정
        setupModalButtons();
        console.log('모달 버튼 이벤트 리스너 설정 완료');

        // 날씨 및 이벤트 효과 연결
        connectWeatherAndEventEffects();
        console.log('날씨 및 이벤트 효과 연결 완료');

        // 업그레이드 인터페이스 개선
        enhanceShopInterface();
        console.log('업그레이드 인터페이스 개선 완료');

        // 초기 날씨 효과 및 동물 추가
        setTimeout(function () {
            updateWeatherEffects();
            addAnimals();
            console.log('초기 시각 효과 적용 완료');
        }, 1000);

        // 게임 루프 시작
        gameLoop();
        console.log('게임 루프 시작');

        // 5초마다 게임 저장
        setInterval(saveGame, 5000);
        console.log('자동 저장 설정 완료');

        console.log('게임 초기화 완료');
    } catch (error) {
        console.error('게임 초기화 중 오류 발생:', error);
    }
}

// 게임 초기화
window.addEventListener('load', initGame);// 업적 시스템
const achievements = [
    {
        id: 'first_growth',
        name: '첫 성장',
        description: '나무가 처음으로 성장했습니다.',
        requirement: () => gameState.treeGrowth >= 100,
        reward: { money: 1000, growthBonus: 1 },
        achieved: false
    },
    {
        id: 'first_purchase',
        name: '첫 구매',
        description: '첫 번째 아이템을 구매했습니다.',
        requirement: () => shopItems.some(item => item.quantity > 0),
        reward: { money: 2000, incomeBonus: 100 },
        achieved: false
    },
    {
        id: 'growth_1000',
        name: '성장하는 나무',
        description: '나무 성장도 1,000 달성',
        requirement: () => gameState.treeGrowth >= 1000,
        reward: { money: 5000, growthBonus: 2 },
        achieved: false
    },
    {
        id: 'growth_10000',
        name: '큰 나무',
        description: '나무 성장도 10,000 달성',
        requirement: () => gameState.treeGrowth >= 10000,
        reward: { money: 20000, growthBonus: 5 },
        achieved: false
    },
    {
        id: 'growth_100000',
        name: '거대한 나무',
        description: '나무 성장도 100,000 달성',
        reward: { money: 100000, growthBonus: 10, incomeBonus: 5000 },
        requirement: () => gameState.treeGrowth >= 100000,
        achieved: false
    },
    {
        id: 'all_items',
        name: '컬렉터',
        description: '모든 종류의 아이템 구매',
        requirement: () => shopItems.every(item => item.quantity > 0),
        reward: { money: 50000, incomeBonus: 2000 },
        achieved: false
    },
    {
        id: 'max_items',
        name: '완벽한 컬렉션',
        description: '모든 아이템을 최대로 구매',
        requirement: () => shopItems.every(item => item.quantity >= item.maxQuantity),
        reward: { money: 200000, growthBonus: 20, incomeBonus: 10000 },
        achieved: false
    },
    {
        id: 'rich',
        name: '부자',
        description: '100,000원 이상 보유',
        requirement: () => gameState.money >= 100000,
        reward: { incomeBonus: 5000 },
        achieved: false
    },
    {
        id: 'super_rich',
        name: '슈퍼 부자',
        description: '1,000,000원 이상 보유',
        requirement: () => gameState.money >= 1000000,
        reward: { incomeBonus: 50000 },
        achieved: false
    },
    {
        id: 'complete',
        name: '할아버지의 유언',
        description: '나무를 완전히 성장시켰습니다.',
        requirement: () => gameState.treeGrowth >= 200000,
        reward: { money: 500000, growthBonus: 50, incomeBonus: 100000 },
        achieved: false
    }
];

// 설정 변수
let settings = {
    soundEnabled: true,
    musicVolume: 0.5,
    effectVolume: 0.5
};

// 모달 요소
let settingsModal, achievementsModal;

// 업적 렌더링
function renderAchievements() {
    const container = document.getElementById('achievements-container');
    if (!container) return;

    container.innerHTML = '';

    achievements.forEach(achievement => {
        const achievementCard = document.createElement('div');
        achievementCard.className = `col-md-6 mb-3`;

        const cardClass = achievement.achieved ? 'bg-success text-white' : 'bg-light';

        let rewardText = '';
        if (achievement.reward.money) {
            rewardText += `${achievement.reward.money.toLocaleString()}원 `;
        }
        if (achievement.reward.growthBonus) {
            rewardText += `성장 속도 +${achievement.reward.growthBonus} `;
        }
        if (achievement.reward.incomeBonus) {
            rewardText += `분당 수입 +${achievement.reward.incomeBonus.toLocaleString()}원`;
        }

        achievementCard.innerHTML = `
            <div class="card ${cardClass}">
                <div class="card-body">
                    <h5 class="card-title">${achievement.name}</h5>
                    <p class="card-text">${achievement.description}</p>
                    <p class="card-text">
                        <small>${achievement.achieved ? '달성 완료!' : '미달성'}</small>
                    </p>
                    <p class="card-text">
                        <strong>보상: ${rewardText}</strong>
                    </p>
                </div>
            </div>
        `;

        container.appendChild(achievementCard);
    });
}

// 업적 체크
function checkAchievements() {
    let newAchievements = false;

    achievements.forEach(achievement => {
        if (!achievement.achieved && achievement.requirement()) {
            achievement.achieved = true;

            // 보상 지급
            if (achievement.reward.money) {
                gameState.money += achievement.reward.money;
            }

            if (achievement.reward.growthBonus) {
                gameState.growthRate += achievement.reward.growthBonus;
            }

            if (achievement.reward.incomeBonus) {
                gameState.incomeRate += achievement.reward.incomeBonus;
            }

            // 업적 달성 알림
            showAchievementNotification(achievement);

            newAchievements = true;
        }
    });

    if (newAchievements) {
        saveAchievements();
    }
}

// 업적 달성 알림
function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';

    let rewardText = '';
    if (achievement.reward.money) {
        rewardText += `${achievement.reward.money.toLocaleString()}원 `;
    }
    if (achievement.reward.growthBonus) {
        rewardText += `성장 속도 +${achievement.reward.growthBonus} `;
    }
    if (achievement.reward.incomeBonus) {
        rewardText += `분당 수입 +${achievement.reward.incomeBonus.toLocaleString()}원`;
    }

    notification.innerHTML = `
        <div class="achievement-icon">🏆</div>
        <div class="achievement-content">
            <h4>업적 달성!</h4>
            <p>${achievement.name}</p>
            <p>보상: ${rewardText}</p>
        </div>
    `;

    document.body.appendChild(notification);

    // 사운드 재생
    playSound(storySound);

    // 애니메이션 효과
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // 일정 시간 후 알림 제거
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 5000);
}

// 업적 저장
function saveAchievements() {
    try {
        const achievementsData = achievements.map(a => ({
            id: a.id,
            achieved: a.achieved
        }));

        localStorage.setItem('treeGameAchievements', JSON.stringify(achievementsData));
    } catch (error) {
        console.error("업적 저장 중 오류:", error);
    }
}

// 업적 불러오기
function loadAchievements() {
    try {
        const savedAchievements = localStorage.getItem('treeGameAchievements');

        if (savedAchievements) {
            const achievementsData = JSON.parse(savedAchievements);

            achievementsData.forEach(savedAchievement => {
                const achievement = achievements.find(a => a.id === savedAchievement.id);
                if (achievement) {
                    achievement.achieved = savedAchievement.achieved;

                    // 이미 달성한 업적의 보상 재적용
                    if (achievement.achieved) {
                        if (achievement.reward.growthBonus) {
                            gameState.growthRate += achievement.reward.growthBonus;
                        }

                        if (achievement.reward.incomeBonus) {
                            gameState.incomeRate += achievement.reward.incomeBonus;
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error("업적 불러오기 중 오류:", error);
    }
}

// 설정 저장
function saveSettings() {
    try {
        localStorage.setItem('treeGameSettings', JSON.stringify(settings));
    } catch (error) {
        console.error("설정 저장 중 오류:", error);
    }
}

// 설정 불러오기
function loadSettings() {
    try {
        const savedSettings = localStorage.getItem('treeGameSettings');

        if (savedSettings) {
            const parsedSettings = JSON.parse(savedSettings);
            settings = { ...settings, ...parsedSettings };
            soundEnabled = settings.soundEnabled;

            // UI 업데이트
            const soundToggle = document.getElementById('soundToggle');
            if (soundToggle) {
                soundToggle.checked = settings.soundEnabled;
            }

            // 볼륨 설정 적용
            updateVolume();
        }
    } catch (error) {
        console.error("설정 불러오기 중 오류:", error);
    }
}

// 볼륨 업데이트
function updateVolume() {
    if (purchaseSound) purchaseSound.volume = settings.effectVolume;
    if (growthSound) growthSound.volume = settings.effectVolume;
    if (storySound) storySound.volume = settings.effectVolume;
}

// 설정 및 업적 시스템 초기화
function initSettingsAndAchievements() {
    try {
        // 모달 요소 가져오기
        const settingsModalElement = document.getElementById('settingsModal');
        const achievementsModalElement = document.getElementById('achievementsModal');

        // 부트스트랩 모달 초기화
        if (typeof bootstrap === 'undefined') {
            console.error("Bootstrap이 로드되지 않았습니다.");
        } else {
            if (settingsModalElement) {
                settingsModal = new bootstrap.Modal(settingsModalElement);
                console.log("설정 모달 초기화 완료");
            }

            if (achievementsModalElement) {
                achievementsModal = new bootstrap.Modal(achievementsModalElement);
                console.log("업적 모달 초기화 완료");
            }
        }

        // 설정 버튼 이벤트 리스너
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', function () {
                console.log("설정 버튼 클릭됨");
                // 설정 UI 업데이트
                updateSettingsUI();

                // 모달이 초기화되지 않았다면 직접 표시
                if (!settingsModal && settingsModalElement) {
                    $(settingsModalElement).modal('show');
                } else if (settingsModal) {
                    settingsModal.show();
                }
            });
        }

        // 업적 버튼 이벤트 리스너
        const achievementsBtn = document.getElementById('achievements-btn');
        if (achievementsBtn) {
            achievementsBtn.addEventListener('click', function () {
                console.log("업적 버튼 클릭됨");
                renderAchievements();

                // 모달이 초기화되지 않았다면 직접 표시
                if (!achievementsModal && achievementsModalElement) {
                    $(achievementsModalElement).modal('show');
                } else if (achievementsModal) {
                    achievementsModal.show();
                }
            });
        }

        // 사운드 토글 이벤트 리스너
        const soundToggle = document.getElementById('soundToggle');
        if (soundToggle) {
            soundToggle.addEventListener('change', () => {
                settings.soundEnabled = soundToggle.checked;
                soundEnabled = soundToggle.checked;
                saveSettings();
            });
        }

        // 게임 초기화 버튼 이벤트 리스너
        const resetGameBtn = document.getElementById('resetGameBtn');
        if (resetGameBtn) {
            resetGameBtn.addEventListener('click', () => {
                if (confirm('정말로 게임을 초기화하시겠습니까? 모든 진행 상황이 삭제됩니다.')) {
                    resetGame();
                    if (settingsModal) settingsModal.hide();
                }
            });
        }

        // 설정 UI에 볼륨 슬라이더 추가
        addVolumeControls();
    } catch (error) {
        console.error("설정 및 업적 시스템 초기화 중 오류:", error);
    }
}

// 설정 UI 업데이트
function updateSettingsUI() {
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle) {
        soundToggle.checked = settings.soundEnabled;
    }

    const musicVolumeSlider = document.getElementById('musicVolumeSlider');
    if (musicVolumeSlider) {
        musicVolumeSlider.value = settings.musicVolume * 100;
    }

    const effectVolumeSlider = document.getElementById('effectVolumeSlider');
    if (effectVolumeSlider) {
        effectVolumeSlider.value = settings.effectVolume * 100;
    }
}

// 볼륨 컨트롤 추가
function addVolumeControls() {
    const settingsModalBody = document.querySelector('#settingsModal .modal-body');
    if (!settingsModalBody) return;

    // 이미 볼륨 컨트롤이 있는지 확인
    if (document.getElementById('musicVolumeSlider')) return;

    // 배경음 볼륨 컨트롤
    const musicVolumeControl = document.createElement('div');
    musicVolumeControl.className = 'mb-3';
    musicVolumeControl.innerHTML = `
        <label for="musicVolumeSlider" class="form-label">배경음 볼륨</label>
        <input type="range" class="form-range" id="musicVolumeSlider" min="0" max="100" value="${settings.musicVolume * 100}">
    `;

    // 효과음 볼륨 컨트롤
    const effectVolumeControl = document.createElement('div');
    effectVolumeControl.className = 'mb-3';
    effectVolumeControl.innerHTML = `
        <label for="effectVolumeSlider" class="form-label">효과음 볼륨</label>
        <input type="range" class="form-range" id="effectVolumeSlider" min="0" max="100" value="${settings.effectVolume * 100}">
    `;

    // 볼륨 컨트롤을 설정 모달에 추가
    const resetButton = settingsModalBody.querySelector('#resetGameBtn').parentElement;
    settingsModalBody.insertBefore(musicVolumeControl, resetButton);
    settingsModalBody.insertBefore(effectVolumeControl, resetButton);

    // 이벤트 리스너 추가
    const musicVolumeSlider = document.getElementById('musicVolumeSlider');
    if (musicVolumeSlider) {
        musicVolumeSlider.addEventListener('input', () => {
            settings.musicVolume = musicVolumeSlider.value / 100;
            updateVolume();
        });

        musicVolumeSlider.addEventListener('change', () => {
            saveSettings();
        });
    }

    const effectVolumeSlider = document.getElementById('effectVolumeSlider');
    if (effectVolumeSlider) {
        effectVolumeSlider.addEventListener('input', () => {
            settings.effectVolume = effectVolumeSlider.value / 100;
            updateVolume();
        });

        effectVolumeSlider.addEventListener('change', () => {
            saveSettings();
        });
    }
}

// 게임 초기화
function resetGame() {
    try {
        // 로컬 스토리지 데이터 삭제
        localStorage.removeItem('treeGame');
        localStorage.removeItem('treeGameAchievements');

        // 게임 상태 초기화
        gameState = {
            treeGrowth: 0,
            money: 0,
            incomeRate: 500,
            growthRate: 1,
            lastUpdate: Date.now(),
            storyProgress: 0,
            treeStage: 0
        };

        // 상점 아이템 초기화
        shopItems.forEach(item => {
            item.quantity = 0;
        });

        // 업적 초기화
        achievements.forEach(achievement => {
            achievement.achieved = false;
        });

        // 파티클 효과 초기화
        particleEffectsEnabled = false;
        particles = [];

        // UI 업데이트
        updateUI();
        renderShop();

        // 알림 표시
        showPurchaseEffect('게임이 초기화되었습니다!');
    } catch (error) {
        console.error("게임 초기화 중 오류:", error);
    }
}

// 업적 알림 스타일 추가
function addAchievementStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .achievement-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: rgba(76, 175, 80, 0.9);
            color: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            transform: translateX(120%);
            transition: transform 0.5s ease;
            z-index: 1000;
            max-width: 300px;
        }
        
        .achievement-notification.show {
            transform: translateX(0);
        }
        
        .achievement-icon {
            font-size: 30px;
            margin-right: 15px;
        }
        
        .achievement-content h4 {
            margin: 0 0 5px 0;
            font-size: 18px;
        }
        
        .achievement-content p {
            margin: 0;
            font-size: 14px;
        }
    `;
    document.head.appendChild(style);
}// 돈을 빠르게 벌 수 있는 수단 추가
const quickMoneyItems = [
    {
        id: 'click_money',
        name: '클릭 수입',
        description: '나무를 클릭하여 즉시 돈을 얻습니다.',
        baseAmount: 100,
        cooldown: 1000, // 밀리초
        lastUsed: 0
    },
    {
        id: 'ad_watch',
        name: '광고 시청',
        description: '광고를 시청하여 큰 금액을 얻습니다.',
        baseAmount: 5000,
        cooldown: 60000, // 밀리초
        lastUsed: 0
    },
    {
        id: 'lottery',
        name: '복권',
        description: '1,000원을 지불하고 최대 10,000원을 얻을 수 있습니다.',
        cost: 1000,
        minReward: 0,
        maxReward: 10000
    }
];

// 클릭 수입 기능 초기화
function initQuickMoneyFeatures() {
    // 나무 클릭 이벤트 추가
    const treeContainer = document.querySelector('.tree-container');
    if (treeContainer) {
        treeContainer.addEventListener('click', handleTreeClick);
    }

    // 빠른 수입 UI 추가
    addQuickMoneyUI();
}

// 나무 클릭 처리
function handleTreeClick() {
    const clickMoney = quickMoneyItems.find(item => item.id === 'click_money');
    if (!clickMoney) return;

    const now = Date.now();
    if (now - clickMoney.lastUsed < clickMoney.cooldown) return;

    // 클릭 수입 계산 (나무 성장도에 따라 증가)
    const amount = Math.floor(clickMoney.baseAmount * (1 + gameState.treeGrowth / 10000));
    gameState.money += amount;

    // 쿨다운 설정
    clickMoney.lastUsed = now;

    // 효과 표시
    showClickMoneyEffect(amount);

    // 사운드 재생
    playSound(purchaseSound);

    // UI 업데이트
    updateUI();
}

// 클릭 수입 효과 표시
function showClickMoneyEffect(amount) {
    const treeContainer = document.querySelector('.tree-container');
    if (!treeContainer) return;

    const effect = document.createElement('div');
    effect.className = 'click-money-effect';
    effect.textContent = `+${amount.toLocaleString()}원`;

    // 클릭 위치에 효과 표시
    const rect = treeContainer.getBoundingClientRect();
    const x = Math.random() * (rect.width - 100) + 50;
    const y = Math.random() * (rect.height - 100) + 50;

    effect.style.left = `${x}px`;
    effect.style.top = `${y}px`;

    treeContainer.appendChild(effect);

    // 애니메이션 효과
    setTimeout(() => {
        effect.classList.add('show');
    }, 10);

    // 일정 시간 후 효과 제거
    setTimeout(() => {
        effect.classList.remove('show');
        setTimeout(() => {
            effect.remove();
        }, 500);
    }, 1500);
}

// 빠른 수입 UI 추가
function addQuickMoneyUI() {
    const container = document.createElement('div');
    container.className = 'quick-money-container';
    container.innerHTML = `
        <h3>빠른 수입</h3>
        <div class="quick-money-items">
            <div class="quick-money-item" id="ad-watch-btn">
                <div class="quick-money-icon">📺</div>
                <div class="quick-money-info">
                    <h4>광고 시청</h4>
                    <p>5,000원 즉시 획득</p>
                </div>
            </div>
            <div class="quick-money-item" id="lottery-btn">
                <div class="quick-money-icon">🎟️</div>
                <div class="quick-money-info">
                    <h4>복권 구매</h4>
                    <p>1,000원으로 최대 10,000원 획득</p>
                </div>
            </div>
        </div>
        <p class="quick-money-tip">💡 나무를 클릭하여 즉시 돈을 얻을 수 있습니다!</p>
    `;

    // 게임 영역 아래에 추가
    const gameArea = document.querySelector('.game-area');
    if (gameArea) {
        gameArea.parentNode.insertBefore(container, gameArea.nextSibling);
    }

    // 이벤트 리스너 추가
    const adWatchBtn = document.getElementById('ad-watch-btn');
    if (adWatchBtn) {
        adWatchBtn.addEventListener('click', handleAdWatch);
    }

    const lotteryBtn = document.getElementById('lottery-btn');
    if (lotteryBtn) {
        lotteryBtn.addEventListener('click', handleLottery);
    }

    // 스타일 추가
    addQuickMoneyStyles();
}

// 광고 시청 처리
function handleAdWatch() {
    const adWatch = quickMoneyItems.find(item => item.id === 'ad_watch');
    if (!adWatch) return;

    const now = Date.now();
    if (now - adWatch.lastUsed < adWatch.cooldown) {
        showPurchaseEffect('아직 광고를 볼 수 없습니다!');
        return;
    }

    // 광고 시청 시뮬레이션 (실제로는 광고 API 연동 필요)
    showPurchaseEffect('광고 시청 중...');

    setTimeout(() => {
        // 광고 시청 보상
        gameState.money += adWatch.baseAmount;

        // 쿨다운 설정
        adWatch.lastUsed = now;

        // 효과 표시
        showPurchaseEffect(`+${adWatch.baseAmount.toLocaleString()}원 획득!`);

        // 사운드 재생
        playSound(storySound);

        // UI 업데이트
        updateUI();
    }, 2000);
}

// 복권 구매 처리
function handleLottery() {
    const lottery = quickMoneyItems.find(item => item.id === 'lottery');
    if (!lottery) return;

    // 비용 확인
    if (gameState.money < lottery.cost) {
        showPurchaseEffect('돈이 부족합니다!');
        return;
    }

    // 비용 지불
    gameState.money -= lottery.cost;

    // 당첨 금액 계산
    const reward = Math.floor(Math.random() * (lottery.maxReward - lottery.minReward + 1)) + lottery.minReward;

    // 보상 지급
    gameState.money += reward;

    // 효과 표시
    if (reward > lottery.cost) {
        showPurchaseEffect(`당첨! +${reward.toLocaleString()}원 획득!`);
        playSound(storySound);
    } else if (reward === 0) {
        showPurchaseEffect('꽝! 다음 기회에...');
        playSound(growthSound);
    } else {
        showPurchaseEffect(`+${reward.toLocaleString()}원 획득!`);
        playSound(purchaseSound);
    }

    // UI 업데이트
    updateUI();
}

// 빠른 수입 스타일 추가
function addQuickMoneyStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .quick-money-container {
            background-color: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
        }
        
        .quick-money-container h3 {
            color: var(--primary-color);
            margin-bottom: 15px;
            text-align: center;
        }
        
        .quick-money-items {
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
        }
        
        .quick-money-item {
            display: flex;
            align-items: center;
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 10px;
            margin: 5px;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.3s;
            width: 45%;
        }
        
        .quick-money-item:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .quick-money-icon {
            font-size: 24px;
            margin-right: 10px;
        }
        
        .quick-money-info h4 {
            margin: 0;
            font-size: 16px;
        }
        
        .quick-money-info p {
            margin: 5px 0 0 0;
            font-size: 12px;
            color: #666;
        }
        
        .quick-money-tip {
            text-align: center;
            margin-top: 15px;
            font-size: 14px;
            color: #666;
        }
        
        .click-money-effect {
            position: absolute;
            color: #4CAF50;
            font-weight: bold;
            font-size: 18px;
            opacity: 0;
            transform: translateY(0);
            transition: opacity 0.5s, transform 1.5s;
            pointer-events: none;
            z-index: 10;
        }
        
        .click-money-effect.show {
            opacity: 1;
            transform: translateY(-50px);
        }
    `;
    document.head.appendChild(style);
}
// 돈을 빠르게 벌 수 있는 수단 추가 - 이미 위에서 선언됨
// 여기서는 중복 선언을 제거합니다
// 원래 이 위치에 있던 코드는 위에서 이미 선언된 quickMoneyItems에 통합되었습니다

// 클릭 수입 기능 초기화
function initQuickMoneyFeatures() {
    // 나무 클릭 이벤트 추가
    const treeContainer = document.querySelector('.tree-container');
    if (treeContainer) {
        treeContainer.addEventListener('click', handleTreeClick);
    }

    // 빠른 수입 UI 추가
    addQuickMoneyUI();
}

// 나무 클릭 처리
function handleTreeClick() {
    const clickMoney = quickMoneyItems.find(item => item.id === 'click_money');
    if (!clickMoney) return;

    const now = Date.now();
    if (now - clickMoney.lastUsed < clickMoney.cooldown) return;

    // 클릭 수입 계산 (나무 성장도에 따라 증가)
    const amount = Math.floor(clickMoney.baseAmount * (1 + gameState.treeGrowth / 10000));
    gameState.money += amount;

    // 쿨다운 설정
    clickMoney.lastUsed = now;

    // 효과 표시
    showClickMoneyEffect(amount);

    // 사운드 재생
    playSound(purchaseSound);

    // UI 업데이트
    updateUI();
}

// 클릭 수입 효과 표시
function showClickMoneyEffect(amount) {
    const treeContainer = document.querySelector('.tree-container');
    if (!treeContainer) return;

    const effect = document.createElement('div');
    effect.className = 'click-money-effect';
    effect.textContent = `+${amount.toLocaleString()}원`;

    // 클릭 위치에 효과 표시
    const rect = treeContainer.getBoundingClientRect();
    const x = Math.random() * (rect.width - 100) + 50;
    const y = Math.random() * (rect.height - 100) + 50;

    effect.style.left = `${x}px`;
    effect.style.top = `${y}px`;

    treeContainer.appendChild(effect);

    // 애니메이션 효과
    setTimeout(() => {
        effect.classList.add('show');
    }, 10);

    // 일정 시간 후 효과 제거
    setTimeout(() => {
        effect.classList.remove('show');
        setTimeout(() => {
            effect.remove();
        }, 500);
    }, 1500);
}

// 빠른 수입 UI 추가
function addQuickMoneyUI() {
    const container = document.createElement('div');
    container.className = 'quick-money-container';
    container.innerHTML = `
        <h3>빠른 수입</h3>
        <div class="quick-money-items">
            <div class="quick-money-item" id="ad-watch-btn">
                <div class="quick-money-icon">📺</div>
                <div class="quick-money-info">
                    <h4>광고 시청</h4>
                    <p>5,000원 즉시 획득</p>
                </div>
            </div>
            <div class="quick-money-item" id="lottery-btn">
                <div class="quick-money-icon">🎟️</div>
                <div class="quick-money-info">
                    <h4>복권 구매</h4>
                    <p>1,000원으로 최대 10,000원 획득</p>
                </div>
            </div>
        </div>
        <p class="quick-money-tip">💡 나무를 클릭하여 즉시 돈을 얻을 수 있습니다!</p>
    `;

    // 게임 영역 아래에 추가
    const gameArea = document.querySelector('.game-area');
    if (gameArea) {
        gameArea.parentNode.insertBefore(container, gameArea.nextSibling);
    }

    // 이벤트 리스너 추가
    const adWatchBtn = document.getElementById('ad-watch-btn');
    if (adWatchBtn) {
        adWatchBtn.addEventListener('click', handleAdWatch);
    }

    const lotteryBtn = document.getElementById('lottery-btn');
    if (lotteryBtn) {
        lotteryBtn.addEventListener('click', handleLottery);
    }

    // 스타일 추가
    addQuickMoneyStyles();
}

// 광고 시청 처리
function handleAdWatch() {
    const adWatch = quickMoneyItems.find(item => item.id === 'ad_watch');
    if (!adWatch) return;

    const now = Date.now();
    if (now - adWatch.lastUsed < adWatch.cooldown) {
        showPurchaseEffect('아직 광고를 볼 수 없습니다!');
        return;
    }

    // 광고 시청 시뮬레이션 (실제로는 광고 API 연동 필요)
    showPurchaseEffect('광고 시청 중...');

    setTimeout(() => {
        // 광고 시청 보상
        gameState.money += adWatch.baseAmount;

        // 쿨다운 설정
        adWatch.lastUsed = now;

        // 효과 표시
        showPurchaseEffect(`+${adWatch.baseAmount.toLocaleString()}원 획득!`);

        // 사운드 재생
        playSound(storySound);

        // UI 업데이트
        updateUI();
    }, 2000);
}

// 복권 구매 처리
function handleLottery() {
    const lottery = quickMoneyItems.find(item => item.id === 'lottery');
    if (!lottery) return;

    // 비용 확인
    if (gameState.money < lottery.cost) {
        showPurchaseEffect('돈이 부족합니다!');
        return;
    }

    // 비용 지불
    gameState.money -= lottery.cost;

    // 당첨 금액 계산
    const reward = Math.floor(Math.random() * (lottery.maxReward - lottery.minReward + 1)) + lottery.minReward;

    // 보상 지급
    gameState.money += reward;

    // 효과 표시
    if (reward > lottery.cost) {
        showPurchaseEffect(`당첨! +${reward.toLocaleString()}원 획득!`);
        playSound(storySound);
    } else if (reward === 0) {
        showPurchaseEffect('꽝! 다음 기회에...');
        playSound(growthSound);
    } else {
        showPurchaseEffect(`+${reward.toLocaleString()}원 획득!`);
        playSound(purchaseSound);
    }

    // UI 업데이트
    updateUI();
}

// 빠른 수입 스타일 추가
function addQuickMoneyStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .quick-money-container {
            background-color: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
        }
        
        .quick-money-container h3 {
            color: var(--primary-color);
            margin-bottom: 15px;
            text-align: center;
        }
        
        .quick-money-items {
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
        }
        
        .quick-money-item {
            display: flex;
            align-items: center;
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 10px;
            margin: 5px;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.3s;
            width: 45%;
        }
        
        .quick-money-item:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .quick-money-icon {
            font-size: 24px;
            margin-right: 10px;
        }
        
        .quick-money-info h4 {
            margin: 0;
            font-size: 16px;
        }
        
        .quick-money-info p {
            margin: 5px 0 0 0;
            font-size: 12px;
            color: #666;
        }
        
        .quick-money-tip {
            text-align: center;
            margin-top: 15px;
            font-size: 14px;
            color: #666;
        }
        
        .click-money-effect {
            position: absolute;
            color: #4CAF50;
            font-weight: bold;
            font-size: 18px;
            opacity: 0;
            transform: translateY(0);
            transition: opacity 0.5s, transform 1.5s;
            pointer-events: none;
            z-index: 10;
        }
        
        .click-money-effect.show {
            opacity: 1;
            transform: translateY(-50px);
        }
    `;
    document.head.appendChild(style);
}

// 업적 알림 스타일 추가
function addAchievementStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .achievement-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: rgba(76, 175, 80, 0.9);
            color: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            transform: translateX(120%);
            transition: transform 0.5s ease;
            z-index: 1000;
            max-width: 300px;
        }
        
        .achievement-notification.show {
            transform: translateX(0);
        }
        
        .achievement-icon {
            font-size: 30px;
            margin-right: 15px;
        }
        
        .achievement-content h4 {
            margin: 0 0 5px 0;
            font-size: 18px;
        }
        
        .achievement-content p {
            margin: 0;
            font-size: 14px;
        }
    `;
    document.head.appendChild(style);
}

// 업적 달성 알림
function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';

    let rewardText = '';
    if (achievement.reward.money) {
        rewardText += `${achievement.reward.money.toLocaleString()}원 `;
    }
    if (achievement.reward.growthBonus) {
        rewardText += `성장 속도 +${achievement.reward.growthBonus} `;
    }
    if (achievement.reward.incomeBonus) {
        rewardText += `분당 수입 +${achievement.reward.incomeBonus.toLocaleString()}원`;
    }

    notification.innerHTML = `
        <div class="achievement-icon">🏆</div>
        <div class="achievement-content">
            <h4>업적 달성!</h4>
            <p>${achievement.name}</p>
            <p>보상: ${rewardText}</p>
        </div>
    `;

    document.body.appendChild(notification);

    // 사운드 재생
    playSound(storySound);

    // 애니메이션 효과
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // 일정 시간 후 알림 제거
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 5000);
}

// 업적 체크
function checkAchievements() {
    let newAchievements = false;

    achievements.forEach(achievement => {
        if (!achievement.achieved && achievement.requirement()) {
            achievement.achieved = true;

            // 보상 지급
            if (achievement.reward.money) {
                gameState.money += achievement.reward.money;
            }

            if (achievement.reward.growthBonus) {
                gameState.growthRate += achievement.reward.growthBonus;
            }

            if (achievement.reward.incomeBonus) {
                gameState.incomeRate += achievement.reward.incomeBonus;
            }

            // 업적 달성 알림
            showAchievementNotification(achievement);

            newAchievements = true;
        }
    });

    if (newAchievements) {
        saveAchievements();
    }
}

// 업적 저장
function saveAchievements() {
    try {
        const achievementsData = achievements.map(a => ({
            id: a.id,
            achieved: a.achieved
        }));

        localStorage.setItem('treeGameAchievements', JSON.stringify(achievementsData));
    } catch (error) {
        console.error("업적 저장 중 오류:", error);
    }
}

// 업적 불러오기
function loadAchievements() {
    try {
        const savedAchievements = localStorage.getItem('treeGameAchievements');

        if (savedAchievements) {
            const achievementsData = JSON.parse(savedAchievements);

            achievementsData.forEach(savedAchievement => {
                const achievement = achievements.find(a => a.id === savedAchievement.id);
                if (achievement) {
                    achievement.achieved = savedAchievement.achieved;

                    // 이미 달성한 업적의 보상 재적용
                    if (achievement.achieved) {
                        if (achievement.reward.growthBonus) {
                            gameState.growthRate += achievement.reward.growthBonus;
                        }

                        if (achievement.reward.incomeBonus) {
                            gameState.incomeRate += achievement.reward.incomeBonus;
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error("업적 불러오기 중 오류:", error);
    }
}

// 설정 저장
function saveSettings() {
    try {
        localStorage.setItem('treeGameSettings', JSON.stringify(settings));
    } catch (error) {
        console.error("설정 저장 중 오류:", error);
    }
}

// 설정 불러오기
function loadSettings() {
    try {
        const savedSettings = localStorage.getItem('treeGameSettings');

        if (savedSettings) {
            const parsedSettings = JSON.parse(savedSettings);
            settings = { ...settings, ...parsedSettings };
            soundEnabled = settings.soundEnabled;

            // UI 업데이트
            const soundToggle = document.getElementById('soundToggle');
            if (soundToggle) {
                soundToggle.checked = settings.soundEnabled;
            }

            // 볼륨 설정 적용
            updateVolume();
        }
    } catch (error) {
        console.error("설정 불러오기 중 오류:", error);
    }
}

// 볼륨 업데이트
function updateVolume() {
    if (purchaseSound) purchaseSound.volume = settings.effectVolume;
    if (growthSound) growthSound.volume = settings.effectVolume;
    if (storySound) storySound.volume = settings.effectVolume;
}

// 나무 시각화 개선 함수들

// 뿌리 추가
function addRoots(count) {
    if (!branchesGroup) return;

    const trunkX = parseFloat(trunkElement.getAttribute('x') || '145');
    const trunkWidth = parseFloat(trunkElement.getAttribute('width') || '10');
    const centerX = trunkX + trunkWidth / 2;

    for (let i = 0; i < count; i++) {
        const rootLength = 10 + Math.random() * 20;
        const rootThickness = 2 + Math.random() * 3;
        const angle = (i % 2 === 0) ? -30 - Math.random() * 30 : 30 + Math.random() * 30;

        const root = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        root.setAttribute('x1', centerX);
        root.setAttribute('y1', 380);
        root.setAttribute('x2', centerX + rootLength * Math.cos(angle * Math.PI / 180));
        root.setAttribute('y2', 380 + rootLength * Math.sin(angle * Math.PI / 180));
        root.setAttribute('stroke', '#5d4037');
        root.setAttribute('stroke-width', rootThickness);
        root.setAttribute('stroke-linecap', 'round');

        branchesGroup.appendChild(root);
    }
}

// 꽃 추가
function addFlowers(count) {
    if (!fruitsGroup || !leavesGroup) return;

    const leaves = leavesGroup.querySelectorAll('.leaf');
    if (leaves.length === 0) return;

    const leafPositions = Array.from(leaves).map(leaf => ({
        x: parseFloat(leaf.getAttribute('cx') || '0'),
        y: parseFloat(leaf.getAttribute('cy') || '0')
    }));

    // 잎 위치를 기반으로 꽃 배치
    for (let i = 0; i < Math.min(count, leafPositions.length); i++) {
        const position = leafPositions[Math.floor(Math.random() * leafPositions.length)];

        // 꽃 중심
        const flowerCenter = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        flowerCenter.setAttribute('cx', position.x + (Math.random() * 10 - 5));
        flowerCenter.setAttribute('cy', position.y + (Math.random() * 10 - 5));
        flowerCenter.setAttribute('r', 3);
        flowerCenter.setAttribute('fill', '#ffeb3b');

        // 꽃잎
        const petalCount = 5;
        const petalGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

        for (let j = 0; j < petalCount; j++) {
            const angle = (j / petalCount) * Math.PI * 2;
            const petalX = parseFloat(flowerCenter.getAttribute('cx')) + Math.cos(angle) * 5;
            const petalY = parseFloat(flowerCenter.getAttribute('cy')) + Math.sin(angle) * 5;

            const petal = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            petal.setAttribute('cx', petalX);
            petal.setAttribute('cy', petalY);
            petal.setAttribute('r', 3);
            petal.setAttribute('fill', '#f48fb1');

            petalGroup.appendChild(petal);
        }

        fruitsGroup.appendChild(petalGroup);
        fruitsGroup.appendChild(flowerCenter);
    }
}

// 새 추가
function addBirds(count) {
    if (!lightEffectsGroup) return;

    for (let i = 0; i < count; i++) {
        const x = 50 + Math.random() * 200;
        const y = 100 + Math.random() * 150;

        const bird = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        bird.setAttribute('d', `M ${x},${y} c 2,-2 4,-4 6,0 c 2,-4 4,-2 6,0 c -2,2 -4,4 -6,0 c -2,4 -4,2 -6,0`);
        bird.setAttribute('fill', '#546e7a');
        bird.setAttribute('class', 'bird');

        // 애니메이션 효과
        const animateX = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        animateX.setAttribute('attributeName', 'transform');
        animateX.setAttribute('attributeType', 'XML');
        animateX.setAttribute('type', 'translate');
        animateX.setAttribute('from', '0 0');
        animateX.setAttribute('to', `${Math.random() > 0.5 ? 50 : -50} ${Math.random() * 20 - 10}`);
        animateX.setAttribute('dur', `${5 + Math.random() * 5}s`);
        animateX.setAttribute('repeatCount', 'indefinite');
        animateX.setAttribute('additive', 'sum');

        bird.appendChild(animateX);
        lightEffectsGroup.appendChild(bird);
    }
}

// 빛나는 오라 추가
function addGlowingAura() {
    if (!lightEffectsGroup || !trunkElement) return;

    const trunkX = parseFloat(trunkElement.getAttribute('x') || '145');
    const trunkWidth = parseFloat(trunkElement.getAttribute('width') || '10');
    const trunkY = parseFloat(trunkElement.getAttribute('y') || '320');
    const trunkHeight = parseFloat(trunkElement.getAttribute('height') || '60');

    const centerX = trunkX + trunkWidth / 2;
    const centerY = trunkY + trunkHeight / 2;

    // 오라 효과
    const aura = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    aura.setAttribute('cx', centerX);
    aura.setAttribute('cy', centerY - 50);
    aura.setAttribute('r', 100);
    aura.setAttribute('fill', 'url(#aura-gradient)');
    aura.setAttribute('opacity', '0.3');
    aura.setAttribute('class', 'aura');

    // 그라데이션 정의
    let defs = treeSvg.querySelector('defs');
    if (!defs) {
        defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        treeSvg.insertBefore(defs, treeSvg.firstChild);
    }

    // 이미 그라데이션이 있는지 확인
    if (!document.getElementById('aura-gradient')) {
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
        gradient.setAttribute('id', 'aura-gradient');
        gradient.setAttribute('cx', '50%');
        gradient.setAttribute('cy', '50%');
        gradient.setAttribute('r', '50%');

        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', '#ffeb3b');
        stop1.setAttribute('stop-opacity', '0.8');

        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('stop-color', '#ffeb3b');
        stop2.setAttribute('stop-opacity', '0');

        gradient.appendChild(stop1);
        gradient.appendChild(stop2);

        defs.appendChild(gradient);
    }

    lightEffectsGroup.appendChild(aura);

    // 애니메이션 효과
    const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    animate.setAttribute('attributeName', 'opacity');
    animate.setAttribute('values', '0.3;0.5;0.3');
    animate.setAttribute('dur', '3s');
    animate.setAttribute('repeatCount', 'indefinite');

    aura.appendChild(animate);
}

// 특별한 효과 추가
function addSpecialEffects() {
    if (!lightEffectsGroup) return;

    // 별 효과
    for (let i = 0; i < 10; i++) {
        const x = Math.random() * 300;
        const y = Math.random() * 200;
        const size = 2 + Math.random() * 3;

        const star = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        star.setAttribute('points', `
            ${x},${y - size} 
            ${x + size / 4},${y - size / 4} 
            ${x + size},${y} 
            ${x + size / 4},${y + size / 4} 
            ${x},${y + size} 
            ${x - size / 4},${y + size / 4} 
            ${x - size},${y} 
            ${x - size / 4},${y - size / 4}
        `);
        star.setAttribute('fill', '#ffeb3b');
        star.setAttribute('class', 'star');

        // 애니메이션 효과
        const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        animate.setAttribute('attributeName', 'opacity');
        animate.setAttribute('values', '0;1;0');
        animate.setAttribute('dur', `${2 + Math.random() * 3}s`);
        animate.setAttribute('repeatCount', 'indefinite');

        star.appendChild(animate);
        lightEffectsGroup.appendChild(star);
    }

    // 무지개 효과
    const rainbow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    rainbow.setAttribute('d', 'M 50,150 C 50,50 250,50 250,150');
    rainbow.setAttribute('stroke', 'url(#rainbow-gradient)');
    rainbow.setAttribute('stroke-width', '5');
    rainbow.setAttribute('fill', 'none');
    rainbow.setAttribute('opacity', '0.5');

    // 그라데이션 정의
    let defs = treeSvg.querySelector('defs');
    if (!defs) {
        defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        treeSvg.insertBefore(defs, treeSvg.firstChild);
    }

    // 이미 그라데이션이 있는지 확인
    if (!document.getElementById('rainbow-gradient')) {
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', 'rainbow-gradient');
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('y1', '0%');
        gradient.setAttribute('x2', '100%');
        gradient.setAttribute('y2', '0%');

        const colors = ['#ff0000', '#ff9900', '#ffff00', '#00ff00', '#0099ff', '#6633ff'];

        colors.forEach((color, index) => {
            const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop.setAttribute('offset', `${index * 100 / (colors.length - 1)}%`);
            stop.setAttribute('stop-color', color);
            gradient.appendChild(stop);
        });

        defs.appendChild(gradient);
    }

    lightEffectsGroup.appendChild(rainbow);
}

// 업데이트된 가지 생성 함수 (자연스러운 곡선 추가)
function updateBranches(count, curved = false) {
    if (!branchesGroup || !trunkElement) return;

    branchesGroup.innerHTML = '';

    const trunkX = parseFloat(trunkElement.getAttribute('x') || '145');
    const trunkWidth = parseFloat(trunkElement.getAttribute('width') || '10');
    const trunkY = parseFloat(trunkElement.getAttribute('y') || '320');
    const trunkHeight = parseFloat(trunkElement.getAttribute('height') || '60');

    const centerX = trunkX + trunkWidth / 2;

    for (let i = 0; i < count; i++) {
        const branchY = trunkY + trunkHeight * (0.2 + 0.6 * (i / count));
        const length = 20 + Math.random() * 40;
        const thickness = 3 + Math.random() * 5;
        const angle = (i % 2 === 0) ? -30 - Math.random() * 20 : 30 + Math.random() * 20;

        if (curved) {
            // 곡선 가지
            const endX = centerX + length * Math.cos(angle * Math.PI / 180);
            const endY = branchY - length * Math.sin(angle * Math.PI / 180);
            const controlX = centerX + (endX - centerX) * 0.5 + (Math.random() * 20 - 10);
            const controlY = branchY + (endY - branchY) * 0.5 + (Math.random() * 20 - 10);

            const branch = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            branch.setAttribute('d', `M ${centerX} ${branchY} Q ${controlX} ${controlY} ${endX} ${endY}`);
            branch.setAttribute('stroke', '#795548');
            branch.setAttribute('stroke-width', thickness);
            branch.setAttribute('fill', 'none');
            branch.setAttribute('stroke-linecap', 'round');

            branchesGroup.appendChild(branch);

            // 작은 가지 추가
            if (Math.random() > 0.5) {
                const smallBranchLength = length * 0.4;
                const smallBranchAngle = angle + (Math.random() * 40 - 20);
                const smallBranchX = endX + smallBranchLength * Math.cos(smallBranchAngle * Math.PI / 180);
                const smallBranchY = endY - smallBranchLength * Math.sin(smallBranchAngle * Math.PI / 180);

                const smallBranch = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                smallBranch.setAttribute('x1', endX);
                smallBranch.setAttribute('y1', endY);
                smallBranch.setAttribute('x2', smallBranchX);
                smallBranch.setAttribute('y2', smallBranchY);
                smallBranch.setAttribute('stroke', '#795548');
                smallBranch.setAttribute('stroke-width', thickness * 0.6);
                smallBranch.setAttribute('stroke-linecap', 'round');

                branchesGroup.appendChild(smallBranch);
            }
        } else {
            // 직선 가지
            const branch = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            branch.setAttribute('x1', centerX);
            branch.setAttribute('y1', branchY);
            branch.setAttribute('x2', centerX + length * Math.cos(angle * Math.PI / 180));
            branch.setAttribute('y2', branchY - length * Math.sin(angle * Math.PI / 180));
            branch.setAttribute('stroke', '#795548');
            branch.setAttribute('stroke-width', thickness);
            branch.setAttribute('stroke-linecap', 'round');

            branchesGroup.appendChild(branch);
        }
    }
}// 구매 버튼 클릭 핸들러 함수
function handleBuyButtonClick(event) {
    console.log('구매 버튼 클릭됨');
    const button = event.currentTarget;
    const itemId = button.getAttribute('data-item-id');
    console.log(`구매할 아이템 ID: ${itemId}`);

    if (!itemId) {
        console.error('아이템 ID를 찾을 수 없습니다.');
        return;
    }

    purchaseItem(itemId);
}// 상점 아이
// 상점 아이템 구매 버튼에 이벤트 리스너 설정
function setupShopItemListeners() {
    console.log('상점 아이템 리스너 설정 시작');

    // 모든 구매 버튼 찾기 - 클래스 선택자 변경
    const buyButtons = document.querySelectorAll('.shop-item button');
    console.log(`구매 버튼 개수: ${buyButtons.length}`);

    if (buyButtons.length === 0) {
        console.error('구매 버튼을 찾을 수 없습니다. 상점이 제대로 렌더링되었는지 확인하세요.');
        return;
    }

    // 각 버튼에 직접 클릭 이벤트 추가
    buyButtons.forEach(button => {
        // 기존 이벤트 리스너 제거를 위해 클론 생성
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        // 새 이벤트 리스너 추가
        newButton.addEventListener('click', function () {
            const itemId = this.getAttribute('data-item-id');
            console.log(`버튼 클릭됨: ${itemId}`);

            if (itemId) {
                // 직접 아이템 구매 처리
                const item = shopItems.find(item => item.id === itemId);

                if (!item) {
                    console.error(`아이템을 찾을 수 없음: ${itemId}`);
                    return;
                }

                if (item.quantity >= item.maxQuantity) {
                    console.error(`최대 수량에 도달함: ${item.name}`);
                    return;
                }

                if (gameState.money < item.price) {
                    console.error(`돈이 부족함: 필요 ${item.price}, 보유 ${gameState.money}`);
                    return;
                }

                console.log(`구매 성공: ${item.name}`);
                gameState.money -= item.price;
                item.quantity += 1;
                item.effect();

                // 구매 효과 애니메이션
                showPurchaseEffect();

                // 사운드 재생
                playSound(purchaseSound);

                // UI 업데이트
                updateUI();

                // 상점 다시 렌더링
                renderShop();

                console.log(`구매 완료: ${item.name}, 남은 금액: ${gameState.money}`);
            } else {
                console.error('아이템 ID를 찾을 수 없습니다');
            }
        });
    });

    console.log('상점 아이템 리스너 설정 완료');
}// 업적 및 설정 버튼 이벤트 리스너 설정
function setupModalButtons() {
    console.log('모달 버튼 이벤트 리스너 설정 시작');

    // 모달 객체 미리 생성
    let achievementsModal, settingsModal;

    try {
        // 부트스트랩이 로드되었는지 확인
        if (typeof bootstrap !== 'undefined') {
            console.log('부트스트랩 발견');

            // 모달 요소 찾기
            const achievementsModalElement = document.getElementById('achievementsModal');
            const settingsModalElement = document.getElementById('settingsModal');

            // 모달 객체 생성
            if (achievementsModalElement) {
                achievementsModal = new bootstrap.Modal(achievementsModalElement);
                console.log('업적 모달 객체 생성됨');
            }

            if (settingsModalElement) {
                settingsModal = new bootstrap.Modal(settingsModalElement);
                console.log('설정 모달 객체 생성됨');
            }
        } else {
            console.error('부트스트랩이 로드되지 않았습니다');
        }
    } catch (error) {
        console.error('모달 객체 생성 중 오류:', error);
    }

    // 업적 버튼
    const achievementsBtn = document.getElementById('achievements-btn');
    if (achievementsBtn) {
        console.log('업적 버튼 찾음');
        achievementsBtn.addEventListener('click', function () {
            console.log('업적 버튼 클릭됨');

            try {
                // 업적 렌더링
                if (typeof renderAchievements === 'function') {
                    renderAchievements();
                }

                // 부트스트랩 모달 열기 - 여러 방법 시도
                const achievementsModalElement = document.getElementById('achievementsModal');
                if (achievementsModalElement) {
                    console.log('업적 모달 찾음');

                    // 방법 1: 미리 생성된 모달 객체 사용
                    if (achievementsModal) {
                        achievementsModal.show();
                        return;
                    }

                    // 방법 2: 새 모달 객체 생성
                    try {
                        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                            const modal = new bootstrap.Modal(achievementsModalElement);
                            modal.show();
                            return;
                        }
                    } catch (error) {
                        console.error('부트스트랩 모달 생성 오류:', error);
                    }

                    // 방법 3: jQuery 사용
                    if (typeof $ !== 'undefined') {
                        $(achievementsModalElement).modal('show');
                        return;
                    }

                    // 방법 4: 직접 표시
                    achievementsModalElement.style.display = 'block';
                    achievementsModalElement.classList.add('show');
                    document.body.classList.add('modal-open');

                    // 배경 오버레이 추가
                    const backdrop = document.createElement('div');
                    backdrop.className = 'modal-backdrop fade show';
                    document.body.appendChild(backdrop);
                } else {
                    console.error('업적 모달을 찾을 수 없습니다');
                }
            } catch (error) {
                console.error('업적 모달 표시 중 오류:', error);
            }
        });
    } else {
        console.error('업적 버튼을 찾을 수 없습니다');
    }

    // 설정 버튼
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        console.log('설정 버튼 찾음');
        settingsBtn.addEventListener('click', function () {
            console.log('설정 버튼 클릭됨');

            try {
                // 설정 UI 업데이트
                if (typeof updateSettingsUI === 'function') {
                    updateSettingsUI();
                }

                // 부트스트랩 모달 열기 - 여러 방법 시도
                const settingsModalElement = document.getElementById('settingsModal');
                if (settingsModalElement) {
                    console.log('설정 모달 찾음');

                    // 방법 1: 미리 생성된 모달 객체 사용
                    if (settingsModal) {
                        settingsModal.show();
                        return;
                    }

                    // 방법 2: 새 모달 객체 생성
                    try {
                        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                            const modal = new bootstrap.Modal(settingsModalElement);
                            modal.show();
                            return;
                        }
                    } catch (error) {
                        console.error('부트스트랩 모달 생성 오류:', error);
                    }

                    // 방법 3: jQuery 사용
                    if (typeof $ !== 'undefined') {
                        $(settingsModalElement).modal('show');
                        return;
                    }

                    // 방법 4: 직접 표시
                    settingsModalElement.style.display = 'block';
                    settingsModalElement.classList.add('show');
                    document.body.classList.add('modal-open');

                    // 배경 오버레이 추가
                    const backdrop = document.createElement('div');
                    backdrop.className = 'modal-backdrop fade show';
                    document.body.appendChild(backdrop);
                } else {
                    console.error('설정 모달을 찾을 수 없습니다');
                }
            } catch (error) {
                console.error('설정 모달 표시 중 오류:', error);
            }
        });
    } else {
        console.error('설정 버튼을 찾을 수 없습니다');
    }

    // 설정 모달 내 사운드 토글 버튼
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle) {
        soundToggle.addEventListener('change', function () {
            settings.soundEnabled = this.checked;
            soundEnabled = this.checked;
            console.log(`사운드 ${soundEnabled ? '켜짐' : '꺼짐'}`);
            saveSettings();
        });
    }

    // 게임 초기화 버튼
    const resetGameBtn = document.getElementById('resetGameBtn');
    if (resetGameBtn) {
        resetGameBtn.addEventListener('click', function () {
            if (confirm('정말로 게임을 초기화하시겠습니까? 모든 진행 상황이 삭제됩니다.')) {
                resetGame();
            }
        });
    }

    console.log('모달 버튼 이벤트 리스너 설정 완료');
}

// 설정 UI 업데이트
function updateSettingsUI() {
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle) {
        soundToggle.checked = settings.soundEnabled;
    }
}

// 게임 초기화
function resetGame() {
    console.log('게임 초기화 시작');

    // 로컬 스토리지 데이터 삭제
    localStorage.removeItem('treeGame');
    localStorage.removeItem('treeGameAchievements');
    localStorage.removeItem('treeGameSettings');

    // 게임 상태 초기화
    gameState = {
        treeGrowth: 0,
        money: 0,
        incomeRate: 500,
        growthRate: 1,
        lastUpdate: Date.now(),
        storyProgress: 0,
        treeStage: 0
    };

    // 상점 아이템 초기화
    shopItems.forEach(item => {
        item.quantity = 0;
    });

    // 업적 초기화
    achievements.forEach(achievement => {
        achievement.achieved = false;
    });

    // 설정 초기화
    settings = {
        soundEnabled: true,
        musicVolume: 0.5,
        effectVolume: 0.5
    };

    // UI 업데이트
    updateUI();
    renderShop();

    console.log('게임 초기화 완료');
    alert('게임이 초기화되었습니다.');

    // 페이지 새로고침
    window.location.reload();
}// 직접 모달 제어 함수
function showModal(modalId) {
    console.log(`모달 표시 시도: ${modalId}`);

    try {
        const modalElement = document.getElementById(modalId);
        if (!modalElement) {
            console.error(`모달 요소를 찾을 수 없음: ${modalId}`);
            return;
        }

        // 모달 닫기 버튼에 이벤트 리스너 추가
        const closeButtons = modalElement.querySelectorAll('.btn-close, [data-bs-dismiss="modal"]');
        closeButtons.forEach(button => {
            // 기존 이벤트 리스너 제거를 위해 클론 생성
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);

            // 새 이벤트 리스너 추가
            newButton.addEventListener('click', function () {
                closeModal(modalId);
            });
        });

        // 부트스트랩 5 방식으로 모달 표시
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            console.log('부트스트랩 Modal 클래스 사용');
            const bsModal = new bootstrap.Modal(modalElement);
            bsModal.show();
            return;
        }

        // 직접 모달 표시 (부트스트랩이 없는 경우)
        console.log('직접 모달 표시 방식 사용');
        modalElement.classList.add('show');
        modalElement.style.display = 'block';
        document.body.classList.add('modal-open');

        // 배경 오버레이 추가
        let backdrop = document.querySelector('.modal-backdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop fade show';
            document.body.appendChild(backdrop);
        }

        // 배경 클릭 시 모달 닫기
        backdrop.addEventListener('click', function () {
            closeModal(modalId);
        });
    } catch (error) {
        console.error(`모달 표시 중 오류: ${error.message}`);
    }
}// 업적 모달 표시 함수
function showAchievements() {
    console.log('업적 모달 표시 함수 호출됨');

    // 업적 렌더링
    if (typeof renderAchievements === 'function') {
        renderAchievements();
    } else {
        console.error('renderAchievements 함수를 찾을 수 없습니다');
    }

    // 모달 표시
    showModal('achievementsModal');
}

// 설정 모달 표시 함수
function showSettings() {
    console.log('설정 모달 표시 함수 호출됨');

    // 설정 UI 업데이트
    if (typeof updateSettingsUI === 'function') {
        updateSettingsUI();
    } else {
        console.error('updateSettingsUI 함수를 찾을 수 없습니다');
    }

    // 모달 표시
    showModal('settingsModal');
}// 모달 닫기 함수
function closeModal(modalId) {
    console.log(`모달 닫기: ${modalId}`);

    try {
        const modalElement = document.getElementById(modalId);
        if (!modalElement) {
            console.error(`모달 요소를 찾을 수 없음: ${modalId}`);
            return;
        }

        // 부트스트랩 5 방식으로 모달 닫기
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            console.log('부트스트랩 Modal 클래스 사용하여 닫기');
            const bsModal = bootstrap.Modal.getInstance(modalElement);
            if (bsModal) {
                bsModal.hide();
            }
        }

        // 직접 모달 닫기 (부트스트랩이 없는 경우)
        console.log('직접 모달 닫기 방식 사용');
        modalElement.classList.remove('show');
        modalElement.style.display = 'none';
        document.body.classList.remove('modal-open');

        // 배경 오버레이 제거 - 모든 backdrop 요소 제거
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => {
            backdrop.remove();
        });

        // 추가 정리 - 모달 관련 클래스 제거
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    } catch (error) {
        console.error(`모달 닫기 중 오류: ${error.message}`);
    }

    // 페이지 상태 강제 복구 (타이머 사용)
    setTimeout(function () {
        fixModalBackdrop();
    }, 300);
}

// 모달 닫기 버튼에 이벤트 리스너 추가
function setupModalCloseButtons() {
    console.log('모달 닫기 버튼 설정');

    // 모든 모달 닫기 버튼에 이벤트 리스너 추가
    document.querySelectorAll('.modal .btn-close, .modal [data-bs-dismiss="modal"]').forEach(button => {
        const modal = button.closest('.modal');
        if (modal) {
            const modalId = modal.id;
            button.addEventListener('click', function () {
                closeModal(modalId);
            });
        }
    });
}

// 페이지 로드 시 모달 닫기 버튼 설정
document.addEventListener('DOMContentLoaded', setupModalCloseButtons);// 부트스트랩 모달 초기화
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOMContentLoaded 이벤트 발생 - 모달 초기화 시작');

    try {
        // 부트스트랩이 로드되었는지 확인
        if (typeof bootstrap !== 'undefined') {
            console.log('부트스트랩 발견 - 모달 초기화 시도');

            // 모든 모달 요소 찾기
            const modalElements = document.querySelectorAll('.modal');
            console.log(`모달 요소 개수: ${modalElements.length}`);

            // 각 모달에 대해 부트스트랩 Modal 객체 생성
            modalElements.forEach(modalElement => {
                try {
                    const modalId = modalElement.id;
                    console.log(`모달 초기화: ${modalId}`);

                    // 모달 객체 생성
                    const modal = new bootstrap.Modal(modalElement);
                    console.log(`모달 초기화 성공: ${modalId}`);
                } catch (modalError) {
                    console.error(`모달 초기화 실패: ${modalElement.id}`, modalError);
                }
            });
        } else {
            console.warn('부트스트랩이 로드되지 않았습니다 - 모달 초기화 불가');
        }
    } catch (error) {
        console.error('모달 초기화 중 오류:', error);
    }
});// 모달 배경 문제 해결 함수
function fixModalBackdrop() {
    // 모든 모달 배경 요소 제거
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => {
        backdrop.remove();
    });

    // body 스타일 초기화
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
}

// 모달 관련 문제 해결을 위한 전역 이벤트 리스너
document.addEventListener('click', function (event) {
    // 모달이 닫힌 후 배경이 남아있는지 확인
    if (!document.querySelector('.modal.show') && document.querySelector('.modal-backdrop')) {
        console.log('모달 배경 문제 감지 - 수정 중');
        fixModalBackdrop();
    }
});// 모달 관련 문제 해결을 위한 긴급 복구 함수
function emergencyModalFix() {
    console.log('긴급 모달 문제 해결 시도');

    // 모든 모달 관련 요소 정리
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
        modal.classList.remove('show');
    });

    // body 스타일 초기화
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';

    console.log('긴급 모달 문제 해결 완료');
}

// 전역 키보드 이벤트 리스너 추가 - ESC 키로 모달 문제 해결
document.addEventListener('keydown', function (event) {
    // ESC 키 누르면 모달 문제 해결
    if (event.key === 'Escape') {
        emergencyModalFix();
    }
});

// 전역 클릭 이벤트 리스너 추가 - 모달 문제 자동 감지 및 해결
document.addEventListener('click', function (event) {
    // 모달이 표시되지 않았는데 배경이 있거나 body에 modal-open 클래스가 있는 경우
    if (!document.querySelector('.modal.show') &&
        (document.querySelector('.modal-backdrop') || document.body.classList.contains('modal-open'))) {
        console.log('모달 문제 자동 감지 - 수정 중');
        emergencyModalFix();
    }
});// 업적 및 업그레이드 문제 해결 함수
function fixAchievementsAndUpgrades() {
    console.log('업적 및 업그레이드 문제 해결 시작');

    try {
        // 업적 시스템 강제 체크
        console.log('업적 강제 체크 중...');
        achievements.forEach(achievement => {
            try {
                // 업적 요구사항 확인
                const requirementMet = achievement.requirement();
                console.log(`업적 [${achievement.name}] 요구사항 충족 여부: ${requirementMet}, 이미 달성: ${achievement.achieved}`);

                if (!achievement.achieved && requirementMet) {
                    console.log(`업적 달성: ${achievement.name}`);
                    achievement.achieved = true;

                    // 보상 지급
                    if (achievement.reward.money) {
                        gameState.money += achievement.reward.money;
                        console.log(`보상 지급: ${achievement.reward.money}원`);
                    }

                    if (achievement.reward.growthBonus) {
                        gameState.growthRate += achievement.reward.growthBonus;
                        console.log(`보상 지급: 성장 속도 +${achievement.reward.growthBonus}`);
                    }

                    if (achievement.reward.incomeBonus) {
                        gameState.incomeRate += achievement.reward.incomeBonus;
                        console.log(`보상 지급: 분당 수입 +${achievement.reward.incomeBonus}원`);
                    }

                    // 업적 달성 알림
                    showAchievementNotification(achievement);
                }
            } catch (error) {
                console.error(`업적 체크 중 오류 [${achievement.name}]:`, error);
            }
        });

        // 상점 아이템 재렌더링
        console.log('상점 아이템 재렌더링 중...');
        renderShop();

        // 상점 아이템 이벤트 리스너 재설정
        console.log('상점 아이템 이벤트 리스너 재설정 중...');
        setupShopItemListeners();

        // UI 업데이트
        updateUI();

        // 게임 상태 저장
        saveGame();
        saveAchievements();

        console.log('업적 및 업그레이드 문제 해결 완료');
        alert('업적 및 업그레이드 기능이 복구되었습니다!');
    } catch (error) {
        console.error('업적 및 업그레이드 문제 해결 중 오류:', error);
    }
}// 날씨 시스템
const weatherTypes = [
    {
        id: 'sunny',
        name: '맑음',
        description: '맑은 날씨입니다. 나무 성장 속도가 10% 증가합니다.',
        icon: '☀️',
        growthMultiplier: 1.1,
        probability: 0.4
    },
    {
        id: 'cloudy',
        name: '흐림',
        description: '흐린 날씨입니다. 나무 성장 속도에 영향이 없습니다.',
        icon: '☁️',
        growthMultiplier: 1.0,
        probability: 0.3
    },
    {
        id: 'rainy',
        name: '비',
        description: '비가 내립니다. 나무 성장 속도가 20% 증가합니다.',
        icon: '🌧️',
        growthMultiplier: 1.2,
        probability: 0.2
    },
    {
        id: 'stormy',
        name: '폭풍',
        description: '폭풍이 몰아칩니다. 나무 성장 속도가 10% 감소합니다.',
        icon: '⛈️',
        growthMultiplier: 0.9,
        probability: 0.05
    },
    {
        id: 'rainbow',
        name: '무지개',
        description: '무지개가 떴습니다! 나무 성장 속도가 50% 증가합니다.',
        icon: '🌈',
        growthMultiplier: 1.5,
        probability: 0.05
    }
];

// 현재 날씨
let currentWeather = weatherTypes[0]; // 기본값: 맑음
let weatherChangeTime = 0; // 날씨 변화 시간

// 날씨 변경 함수
function changeWeather() {
    // 확률에 따라 날씨 선택
    const rand = Math.random();
    let cumulativeProbability = 0;

    for (const weather of weatherTypes) {
        cumulativeProbability += weather.probability;
        if (rand <= cumulativeProbability) {
            currentWeather = weather;
            break;
        }
    }

    // 날씨 변화 알림
    showWeatherNotification(currentWeather);

    // 다음 날씨 변화 시간 설정 (1~3분)
    weatherChangeTime = Date.now() + (60000 + Math.random() * 120000);

    // UI 업데이트
    updateWeatherUI();
}

// 날씨 UI 업데이트
function updateWeatherUI() {
    const weatherElement = document.getElementById('current-weather');
    if (weatherElement) {
        weatherElement.innerHTML = `${currentWeather.icon} ${currentWeather.name}: ${currentWeather.description}`;
    }
}

// 날씨 변화 알림
function showWeatherNotification(weather) {
    const notification = document.createElement('div');
    notification.className = 'weather-notification';

    notification.innerHTML = `
        <div class="weather-icon">${weather.icon}</div>
        <div class="weather-content">
            <h4>날씨 변화</h4>
            <p>${weather.name}: ${weather.description}</p>
        </div>
    `;

    document.body.appendChild(notification);

    // 3초 후 알림 제거
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}// 랜덤 이벤트 시스템
const randomEvents = [
    {
        id: 'traveling_merchant',
        name: '여행하는 상인',
        description: '여행하는 상인이 찾아와 특별한 성장 촉진제를 판매합니다.',
        icon: '🧙‍♂️',
        probability: 0.1,
        effect: () => {
            // 성장 촉진제 구매 여부 확인
            if (confirm('여행하는 상인이 특별한 성장 촉진제를 판매합니다. 5,000원에 구매하시겠습니까? (나무 성장 속도 +5)')) {
                if (gameState.money >= 5000) {
                    gameState.money -= 5000;
                    gameState.growthRate += 5;
                    alert('성장 촉진제를 구매했습니다! 나무 성장 속도가 5 증가했습니다.');
                } else {
                    alert('돈이 부족합니다.');
                }
            }
        }
    },
    {
        id: 'curious_children',
        name: '호기심 많은 아이들',
        description: '호기심 많은 아이들이 나무를 괴롭힙니다. 성장이 잠시 멈춥니다.',
        icon: '👶',
        probability: 0.08,
        effect: () => {
            // 아이들이 나무를 괴롭히는 이벤트
            alert('호기심 많은 아이들이 나무를 괴롭힙니다. 성장이 30초 동안 멈춥니다.');
            const originalGrowthRate = gameState.growthRate;
            gameState.growthRate = 0;

            // 30초 후 성장 속도 복구
            setTimeout(() => {
                gameState.growthRate = originalGrowthRate;
                alert('아이들이 떠났습니다. 나무 성장이 다시 시작됩니다.');
            }, 30000);
        }
    },
    {
        id: 'bird_nest',
        name: '새 둥지',
        description: '새가 나무에 둥지를 틀었습니다. 수입이 증가합니다.',
        icon: '🐦',
        probability: 0.12,
        effect: () => {
            // 새 둥지 이벤트
            const incomeBonus = Math.floor(gameState.incomeRate * 0.1); // 현재 수입의 10%
            gameState.incomeRate += incomeBonus;
            alert(`새가 나무에 둥지를 틀었습니다! 사람들이 구경하러 오면서 분당 수입이 ${incomeBonus}원 증가했습니다.`);
        }
    },
    {
        id: 'gardener',
        name: '정원사',
        description: '지나가던 정원사가 나무 관리를 도와줍니다.',
        icon: '👨‍🌾',
        probability: 0.1,
        effect: () => {
            // 정원사 이벤트
            const growthBonus = Math.floor(Math.random() * 3) + 1;
            gameState.growthRate += growthBonus;
            alert(`지나가던 정원사가 나무 관리를 도와줍니다! 성장 속도가 ${growthBonus} 증가했습니다.`);
        }
    },
    {
        id: 'falling_star',
        name: '별똥별',
        description: '별똥별이 떨어져 나무에 마법의 힘을 부여합니다.',
        icon: '🌠',
        probability: 0.05,
        effect: () => {
            // 별똥별 이벤트 (매우 희귀)
            const growthBonus = 10;
            const incomeBonus = 2000;
            gameState.growthRate += growthBonus;
            gameState.incomeRate += incomeBonus;
            alert(`별똥별이 나무 근처에 떨어졌습니다! 마법의 힘으로 성장 속도가 ${growthBonus} 증가하고, 분당 수입이 ${incomeBonus}원 증가했습니다.`);

            // 파티클 효과 활성화
            enableParticleEffects();
        }
    },
    {
        id: 'drought',
        name: '가뭄',
        description: '가뭄이 찾아와 나무 성장이 느려집니다.',
        icon: '🏜️',
        probability: 0.07,
        effect: () => {
            // 가뭄 이벤트
            alert('가뭄이 찾아왔습니다. 나무 성장 속도가 일시적으로 50% 감소합니다.');
            const originalGrowthRate = gameState.growthRate;
            gameState.growthRate = Math.max(1, Math.floor(gameState.growthRate * 0.5));

            // 1분 후 성장 속도 복구
            setTimeout(() => {
                gameState.growthRate = originalGrowthRate;
                alert('가뭄이 끝났습니다. 나무 성장 속도가 복구되었습니다.');
            }, 60000);
        }
    }
];

// 이벤트 발생 시간
let nextEventTime = 0;

// 랜덤 이벤트 체크
function checkRandomEvents() {
    const now = Date.now();

    // 이벤트 발생 시간이 되었는지 확인
    if (now >= nextEventTime) {
        // 확률에 따라 이벤트 발생
        const rand = Math.random();
        if (rand < 0.2) { // 20% 확률로 이벤트 발생
            triggerRandomEvent();
        }

        // 다음 이벤트 체크 시간 설정 (2~5분)
        nextEventTime = now + (120000 + Math.random() * 180000);
    }
}

// 랜덤 이벤트 발생
function triggerRandomEvent() {
    // 확률에 따라 이벤트 선택
    const rand = Math.random();
    let cumulativeProbability = 0;
    let selectedEvent = null;

    for (const event of randomEvents) {
        cumulativeProbability += event.probability;
        if (rand <= cumulativeProbability) {
            selectedEvent = event;
            break;
        }
    }

    if (selectedEvent) {
        // 이벤트 알림
        showEventNotification(selectedEvent);

        // 이벤트 효과 적용
        selectedEvent.effect();
    }
}

// 이벤트 알림
function showEventNotification(event) {
    const notification = document.createElement('div');
    notification.className = 'event-notification';

    notification.innerHTML = `
        <div class="event-icon">${event.icon}</div>
        <div class="event-content">
            <h4>${event.name}</h4>
            <p>${event.description}</p>
        </div>
    `;

    document.body.appendChild(notification);

    // 5초 후 알림 제거
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 5000);
}// 날씨 효과 업데이트 함수
function updateWeatherEffects() {
    const weatherEffectsGroup = document.getElementById('weather-effects');
    if (!weatherEffectsGroup) return;

    // 기존 효과 제거
    weatherEffectsGroup.innerHTML = '';

    // 하늘 색상 업데이트
    const skyElement = document.getElementById('sky');
    const sunMoonElement = document.getElementById('sun-moon');

    if (skyElement && sunMoonElement) {
        switch (currentWeather.id) {
            case 'sunny':
                // 맑은 날씨 효과
                skyElement.setAttribute('fill', 'url(#sky-gradient)');
                sunMoonElement.setAttribute('fill', '#FFD700');
                sunMoonElement.setAttribute('filter', 'url(#glow)');

                // 햇빛 광선 효과
                for (let i = 0; i < 8; i++) {
                    const angle = i * 45;
                    const ray = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    const rayLength = 15;

                    ray.setAttribute('x1', 250 + 20 * Math.cos(angle * Math.PI / 180));
                    ray.setAttribute('y1', 50 + 20 * Math.sin(angle * Math.PI / 180));
                    ray.setAttribute('x2', 250 + (20 + rayLength) * Math.cos(angle * Math.PI / 180));
                    ray.setAttribute('y2', 50 + (20 + rayLength) * Math.sin(angle * Math.PI / 180));
                    ray.setAttribute('stroke', '#FFD700');
                    ray.setAttribute('stroke-width', '2');
                    ray.setAttribute('class', 'sun-ray');

                    weatherEffectsGroup.appendChild(ray);
                }
                break;

            case 'cloudy':
                // 흐린 날씨 효과
                skyElement.setAttribute('fill', '#E0E0E0');
                sunMoonElement.setAttribute('fill', '#D3D3D3');
                sunMoonElement.setAttribute('filter', 'none');

                // 추가 구름
                for (let i = 0; i < 3; i++) {
                    const cloudGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                    const x = 50 + i * 80;
                    const y = 100 + i * 20;

                    const cloud1 = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
                    cloud1.setAttribute('cx', x);
                    cloud1.setAttribute('cy', y);
                    cloud1.setAttribute('rx', 30);
                    cloud1.setAttribute('ry', 20);
                    cloud1.setAttribute('fill', '#BDBDBD');

                    const cloud2 = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
                    cloud2.setAttribute('cx', x + 25);
                    cloud2.setAttribute('cy', y - 5);
                    cloud2.setAttribute('rx', 25);
                    cloud2.setAttribute('ry', 15);
                    cloud2.setAttribute('fill', '#BDBDBD');

                    cloudGroup.appendChild(cloud1);
                    cloudGroup.appendChild(cloud2);
                    cloudGroup.setAttribute('class', 'extra-cloud');

                    weatherEffectsGroup.appendChild(cloudGroup);
                }
                break;

            case 'rainy':
                // 비 효과
                skyElement.setAttribute('fill', '#90A4AE');
                sunMoonElement.setAttribute('fill', '#BDBDBD');
                sunMoonElement.stribute('filter', 'none');

                // 비 떨어지는 효과
                for (let i = 0; i < 40; i++) {
                    const raindrop = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    const x = Math.random() * 300;
                    const y = Math.random() * 200;
                    const length = 10 + Math.random() * 10;

                    raindrop.setAttribute('x1', x);
                    raindrop.setAttribute('y1', y);
                    raindrop.setAttribute('x2', x - 2);
                    raindrop.setAttribute('y2', y + length);
                    raindrop.setAttribute('stroke', '#64B5F6');
                    raindrop.setAttribute('stroke-width', '1');
                    raindrop.setAttribute('class', 'raindrop');

                    weatherEffectsGroup.appendChild(raindrop);
                }

                // 비구름
                const rainCloud = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                rainCloud.innerHTML = `
                    <ellipse cx="150" cy="80" rx="70" ry="30" fill="#78909C" />
                    <ellipse cx="120" cy="70" rx="50" ry="25" fill="#78909C" />
                    <ellipse cx="180" cy="70" rx="50" ry="25" fill="#78909C" />
                `;
                rainCloud.setAttribute('class', 'rain-cloud');

                weatherEffectsGroup.appendChild(rainCloud);
                break;

            case 'stormy':
                // 폭풍 효과
                skyElement.setAttribute('fill', '#455A64');
                sunMoonElement.setAttribute('fill', '#37474F');
                sunMoonElement.setAttribute('filter', 'none');

                // 번개 효과
                for (let i = 0; i < 2; i++) {
                    const lightning = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    const startX = 100 + i * 100;
                    const startY = 100;

                    const path = `M ${startX} ${startY} 
                                 L ${startX - 10} ${startY + 30} 
                                 L ${startX + 5} ${startY + 30} 
                                 L ${startX - 15} ${startY + 80} 
                                 L ${startX + 5} ${startY + 50} 
                                 L ${startX - 10} ${startY + 50} 
                                 Z`;

                    lightning.setAttribute('d', path);
                    lightning.setAttribute('fill', '#FFEB3B');
                    lightning.setAttribute('class', 'lightning');

                    weatherEffectsGroup.appendChild(lightning);
                }

                // 폭풍 구름
                const stormCloud = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                stormCloud.innerHTML = `
                    <ellipse cx="150" cy="80" rx="100" ry="40" fill="#37474F" />
                    <ellipse cx="100" cy="70" rx="60" ry="30" fill="#37474F" />
                    <ellipse cx="200" cy="70" rx="60" ry="30" fill="#37474F" />
                `;
                stormCloud.setAttribute('class', 'storm-cloud');

                weatherEffectsGroup.appendChild(stormCloud);
                break;

            case 'rainbow':
                // 무지개 효과
                skyElement.setAttribute('fill', '#E3F2FD');
                sunMoonElement.setAttribute('fill', '#FFD700');
                sunMoonElement.setAttribute('filter', 'url(#glow)');

                // 무지개 그리기
                const rainbow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                rainbow.setAttribute('d', 'M 0,200 C 100,100 200,100 300,200');
                rainbow.setAttribute('stroke-width', '20');
                rainbow.setAttribute('stroke', '#F44336');
                rainbow.setAttribute('fill', 'none');
                rainbow.setAttribute('class', 'rainbow-arc');

                const rainbow2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                rainbow2.setAttribute('d', 'M 0,200 C 100,100 200,100 300,200');
                rainbow2.setAttribute('stroke-width', '15');
                rainbow2.setAttribute('stroke', '#FF9800');
                rainbow2.setAttribute('fill', 'none');
                rainbow2.setAttribute('class', 'rainbow-arc');

                const rainbow3 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                rainbow3.setAttribute('d', 'M 0,200 C 100,100 200,100 300,200');
                rainbow3.setAttribute('stroke-width', '10');
                rainbow3.setAttribute('stroke', '#FFEB3B');
                rainbow3.setAttribute('fill', 'none');
                rainbow3.setAttribute('class', 'rainbow-arc');

                const rainbow4 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                rainbow4.setAttribute('d', 'M 0,200 C 100,100 200,100 300,200');
                rainbow4.setAttribute('stroke-width', '5');
                rainbow4.setAttribute('stroke', '#4CAF50');
                rainbow4.setAttribute('fill', 'none');
                rainbow4.setAttribute('class', 'rainbow-arc');

                weatherEffectsGroup.appendChild(rainbow);
                weatherEffectsGroup.appendChild(rainbow2);
                weatherEffectsGroup.appendChild(rainbow3);
                weatherEffectsGroup.appendChild(rainbow4);
                break;
        }
    }
}

// 이벤트 효과 추가 함수
function addEventEffect(eventId) {
    const eventEffectsGroup = document.getElementById('event-effects');
    if (!eventEffectsGroup) return;

    // 기존 효과 제거
    eventEffectsGroup.innerHTML = '';

    switch (eventId) {
        case 'traveling_merchant':
            // 여행하는 상인 효과
            const merchant = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            merchant.innerHTML = `
                <ellipse cx="80" cy="370" rx="15" ry="5" fill="#795548" opacity="0.5" />
                <rect x="75" y="345" width="10" height="25" fill="#5D4037" />
                <circle cx="80" cy="340" r="10" fill="#FFA726" />
                <rect x="70" y="335" width="20" height="5" fill="#8D6E63" />
                <text x="80" y="335" text-anchor="middle" fill="white" font-size="12">🧙‍♂️</text>
            `;
            merchant.setAttribute('class', 'event-merchant');

            eventEffectsGroup.appendChild(merchant);
            break;

        case 'curious_children':
            // 호기심 많은 아이들 효과
            const children = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            children.innerHTML = `
                <ellipse cx="200" cy="370" rx="30" ry="5" fill="#795548" opacity="0.5" />
                <text x="190" y="355" font-size="20">👶</text>
                <text x="210" y="360" font-size="20">👧</text>
            `;
            children.setAttribute('class', 'event-children');

            eventEffectsGroup.appendChild(children);
            break;

        case 'bird_nest':
            // 새 둥지 효과
            const birdNest = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            birdNest.innerHTML = `
                <ellipse cx="150" cy="250" rx="15" ry="8" fill="#8D6E63" />
                <ellipse cx="150" cy="248" rx="10" ry="5" fill="#A1887F" />
                <text x="150" y="245" text-anchor="middle" font-size="15">🐦</text>
            `;
            birdNest.setAttribute('class', 'event-bird-nest');

            eventEffectsGroup.appendChild(birdNest);
            break;

        case 'gardener':
            // 정원사 효과
            const gardener = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            gardener.innerHTML = `
                <ellipse cx="220" cy="370" rx="15" ry="5" fill="#795548" opacity="0.5" />
                <rect x="215" y="345" width="10" height="25" fill="#5D4037" />
                <circle cx="220" cy="340" r="10" fill="#FFA726" />
                <text x="220" y="345" text-anchor="middle" fill="white" font-size="12">👨‍🌾</text>
            `;
            gardener.setAttribute('class', 'event-gardener');

            eventEffectsGroup.appendChild(gardener);
            break;

        case 'falling_star':
            // 별똥별 효과
            const fallingStar = document.createElementNS('http://www.w3.org/2000/svg', 'g');

            // 별 경로
            const starPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            starPath.setAttribute('d', 'M 250,50 L 150,250');
            starPath.setAttribute('stroke', '#FFEB3B');
            starPath.setAttribute('stroke-width', '2');
            starPath.setAttribute('stroke-dasharray', '5,5');
            starPath.setAttribute('opacity', '0.7');

            // 별
            const star = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            star.setAttribute('x', '150');
            star.setAttribute('y', '250');
            star.setAttribute('font-size', '30');
            star.setAttribute('text-anchor', 'middle');
            star.textContent = '🌠';
            star.setAttribute('class', 'falling-star');

            fallingStar.appendChild(starPath);
            fallingStar.appendChild(star);

            eventEffectsGroup.appendChild(fallingStar);
            break;

        case 'drought':
            // 가뭄 효과
            const drought = document.createElementNS('http://www.w3.org/2000/svg', 'g');

            // 갈라진 땅 효과
            for (let i = 0; i < 5; i++) {
                const crack = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const startX = 50 + i * 50;
                const path = `M ${startX},380 Q ${startX + 10},375 ${startX + 20},380 Q ${startX + 30},385 ${startX + 40},380`;

                crack.setAttribute('d', path);
                crack.setAttribute('stroke', '#5D4037');
                crack.setAttribute('stroke-width', '2');
                crack.setAttribute('fill', 'none');

                drought.appendChild(crack);
            }

            // 태양 강조
            const hotSun = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            hotSun.setAttribute('cx', '250');
            hotSun.setAttribute('cy', '50');
            hotSun.setAttribute('r', '25');
            hotSun.setAttribute('fill', '#FF5722');
            hotSun.setAttribute('filter', 'url(#glow)');

            drought.appendChild(hotSun);
            drought.setAttribute('class', 'event-drought');

            eventEffectsGroup.appendChild(drought);
            break;
    }
}

// 동물/곤충 추가 함수
function addAnimals() {
    const animalsGroup = document.getElementById('animals');
    if (!animalsGroup) return;

    // 기존 동물 제거
    animalsGroup.innerHTML = '';

    // 나무 성장도에 따라 동물 추가
    if (gameState.treeGrowth >= 1000) {
        // 나비
        const butterfly = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        butterfly.setAttribute('x', '180');
        butterfly.setAttribute('y', '280');
        butterfly.setAttribute('font-size', '15');
        butterfly.textContent = '🦋';
        butterfly.setAttribute('class', 'butterfly');

        animalsGroup.appendChild(butterfly);
    }

    if (gameState.treeGrowth >= 5000) {
        // 새
        const bird = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        bird.setAttribute('x', '120');
        bird.setAttribute('y', '220');
        bird.setAttribute('font-size', '15');
        bird.textContent = '🐦';
        bird.setAttribute('class', 'bird');

        animalsGroup.appendChild(bird);
    }

    if (gameState.treeGrowth >= 20000) {
        // 다람쥐
        const squirrel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        squirrel.setAttribute('x', '160');
        squirrel.setAttribute('y', '300');
        squirrel.setAttribute('font-size', '15');
        squirrel.textContent = '🐿️';
        squirrel.setAttribute('class', 'squirrel');

        animalsGroup.appendChild(squirrel);
    }

    if (gameState.treeGrowth >= 50000) {
        // 올빼미
        const owl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        owl.setAttribute('x', '140');
        owl.setAttribute('y', '200');
        owl.setAttribute('font-size', '20');
        owl.textContent = '🦉';
        owl.setAttribute('class', 'owl');

        animalsGroup.appendChild(owl);
    }
}// 날씨 및 이벤트 효과 연결 함수
function connectWeatherAndEventEffects() {
    // 기존 changeWeather 함수 확장
    const originalChangeWeather = changeWeather;
    changeWeather = function () {
        originalChangeWeather();
        updateWeatherEffects();
    };

    // 기존 triggerRandomEvent 함수 확장
    const originalTriggerRandomEvent = triggerRandomEvent;
    triggerRandomEvent = function () {
        const event = originalTriggerRandomEvent();
        if (event) {
            addEventEffect(event.id);
        }
        return event;
    };

    // 게임 루프에 동물 추가 함수 연결
    const originalUpdateUI = updateUI;
    updateUI = function () {
        originalUpdateUI();
        addAnimals();
    };
}

// 업그레이드 인터페이스 개선
function enhanceShopInterface() {
    // 상점 아이템 카드 스타일 개선
    const style = document.createElement('style');
    style.textContent = `
        .shop-items-container {
            display: flex;
            flex-wrap: nowrap;
            overflow-x: auto;
            gap: 20px;
            margin-top: 20px;
            padding-bottom: 20px;
        }
        
        .shop-item {
            background-color: #fff;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s, box-shadow 0.3s;
            overflow: hidden;
            position: relative;
            padding-bottom: 60px;
        }
        
        .shop-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }
        
        .shop-item h3 {
            background-color: #f5f5f5;
            margin: 0;
            padding: 15px;
            font-size: 18px;
            color: #333;
            border-bottom: 1px solid #eee;
        }
        
        .shop-item p {
            padding: 0 15px;
            margin: 10px 0;
            color: #666;
        }
        
        .shop-item .price {
            font-weight: bold;
            color: #4CAF50;
            font-size: 16px;
        }
        
        .shop-item button {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            padding: 12px;
            border: none;
            background-color: #4CAF50;
            color: white;
            font-weight: bold;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        
        .shop-item button:hover:not(:disabled) {
            background-color: #388E3C;
        }
        
        .shop-item button:disabled {
            background-color: #ccc;
            cursor: not-allowed;
        }
        
        .category-tag {
            position: absolute;
            top: 15px;
            right: 15px;
            background-color: #f1f1f1;
            padding: 3px 8px;
            border-radius: 10px;
            font-size: 12px;
            color: #666;
        }
        
        .shop-item[data-category="성장"] .category-tag {
            background-color: #E8F5E9;
            color: #388E3C;
        }
        
        .shop-item[data-category="수입"] .category-tag {
            background-color: #E3F2FD;
            color: #1976D2;
        }
        
        .shop-item[data-category="날씨"] .category-tag {
            background-color: #F3E5F5;
            color: #7B1FA2;
        }
        
        .shop-item[data-category="이벤트"] .category-tag {
            background-color: #FFF3E0;
            color: #E64A19;
        }
        
        .shop-item[data-category="특별"] .category-tag {
            background-color: #FFEBEE;
            color: #D32F2F;
        }
        
        .shop-categories {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 10px;
            margin-bottom: 20px;
        }
        
        .category-btn {
            padding: 8px 15px;
            border: none;
            border-radius: 20px;
            background-color: #f1f1f1;
            color: #333;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .category-btn:hover {
            background-color: #e0e0e0;
        }
        
        .category-btn.active {
            background-color: #4CAF50;
            color: white;
        }
        
        /* 날씨 애니메이션 */
        .raindrop {
            animation: falling 1s linear infinite;
        }
        
        .lightning {
            animation: flash 2s infinite;
        }
        
        .rainbow-arc {
            animation: fadeInOut 5s infinite;
        }
        
        .sun-ray {
            animation: pulse 2s infinite;
        }
        
        .cloud {
            animation: float 10s infinite ease-in-out;
        }
        
        .extra-cloud {
            animation: float 15s infinite ease-in-out;
        }
        
        /* 이벤트 애니메이션 */
        .event-merchant, .event-gardener {
            animation: walkIn 10s infinite alternate;
        }
        
        .event-children {
            animation: bounce 2s infinite;
        }
        
        .event-bird-nest {
            animation: sway 3s infinite;
        }
        
        .falling-star {
            animation: fallingStar 3s infinite;
        }
        
        /* 동물 애니메이션 */
        .butterfly {
            animation: flutter 5s infinite alternate;
        }
        
        .bird {
            animation: fly 8s infinite;
        }
        
        .squirrel {
            animation: hop 4s infinite;
        }
        
        .owl {
            animation: rotate 6s infinite;
        }
        
        @keyframes falling {
            0% { transform: translateY(-10px); }
            100% { transform: translateY(200px); }
        }
        
        @keyframes flash {
            0%, 50%, 100% { opacity: 0; }
            25%, 75% { opacity: 1; }
        }
        
        @keyframes fadeInOut {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.8; }
        }
        
        @keyframes walkIn {
            0% { transform: translateX(-50px); }
            100% { transform: translateX(50px); }
        }
        
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        
        @keyframes flutter {
            0% { transform: translate(0, 0) rotate(0deg); }
            25% { transform: translate(10px, -10px) rotate(10deg); }
            50% { transform: translate(20px, 0) rotate(0deg); }
            75% { transform: translate(10px, 10px) rotate(-10deg); }
            100% { transform: translate(0, 0) rotate(0deg); }
        }
        
        @keyframes fly {
            0% { transform: translate(0, 0); }
            25% { transform: translate(30px, -20px); }
            50% { transform: translate(60px, 0); }
            75% { transform: translate(30px, 20px); }
            100% { transform: translate(0, 0); }
        }
        
        @keyframes hop {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
        }
        
        @keyframes rotate {
            0% { transform: rotate(-5deg); }
            50% { transform: rotate(5deg); }
            100% { transform: rotate(-5deg); }
        }
        
        @keyframes fallingStar {
            0% { transform: translate(100px, -100px) scale(0.5); opacity: 1; }
            100% { transform: translate(0, 0) scale(1); opacity: 0.8; }
        }
    `;

    document.head.appendChild(style);
}

// 초기화 시 날씨 및 이벤트 효과 연결 및 인터페이스 개선
document.addEventListener('DOMContentLoaded', function () {
    connectWeatherAndEventEffects();
    enhanceShopInterface();

    // 초기 날씨 효과 적용
    setTimeout(function () {
        updateWeatherEffects();
        addAnimals();
    }, 1000);
});// 다각형 잎 생성 함수
function createPolygonLeaf(x, y, size, color) {
    if (!leavesGroup) return;

    // 잎 모양 다각형 생성
    const leaf = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    // 잎 모양 종류 (0: 타원형, 1: 하트형, 2: 별모양, 3: 단풍잎)
    const leafType = Math.floor(Math.random() * 4);

    let pathData = '';

    switch (leafType) {
        case 0: // 타원형 잎
            const angle = Math.random() * 360;
            pathData = `M ${x} ${y - size} 
                       C ${x + size} ${y - size}, ${x + size} ${y + size}, ${x} ${y + size} 
                       C ${x - size} ${y + size}, ${x - size} ${y - size}, ${x} ${y - size}`;
            break;

        case 1: // 하트형 잎
            pathData = `M ${x} ${y + size * 0.7} 
                       C ${x + size * 0.7} ${y}, ${x + size * 0.5} ${y - size * 0.5}, ${x} ${y - size * 0.7} 
                       C ${x - size * 0.5} ${y - size * 0.5}, ${x - size * 0.7} ${y}, ${x} ${y + size * 0.7}`;
            break;

        case 2: // 별모양 잎
            const points = 5;
            const outerRadius = size;
            const innerRadius = size * 0.4;

            for (let i = 0; i < points * 2; i++) {
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const angle = (i * Math.PI) / points;
                const pointX = x + radius * Math.sin(angle);
                const pointY = y - radius * Math.cos(angle);

                pathData += (i === 0 ? 'M ' : 'L ') + pointX + ' ' + pointY + ' ';
            }
            pathData += 'Z';
            break;

        case 3: // 단풍잎 모양
            pathData = `M ${x} ${y - size} 
                       L ${x + size * 0.3} ${y - size * 0.3} 
                       L ${x + size} ${y - size * 0.5} 
                       L ${x + size * 0.5} ${y} 
                       L ${x + size * 0.8} ${y + size * 0.8} 
                       L ${x} ${y + size * 0.5} 
                       L ${x - size * 0.8} ${y + size * 0.8} 
                       L ${x - size * 0.5} ${y} 
                       L ${x - size} ${y - size * 0.5} 
                       L ${x - size * 0.3} ${y - size * 0.3} 
                       Z`;
            break;
    }

    leaf.setAttribute('d', pathData);
    leaf.setAttribute('fill', color);
    leaf.setAttribute('class', 'leaf');

    // 약간의 회전 추가
    const rotation = Math.random() * 360;
    leaf.setAttribute('transform', `rotate(${rotation} ${x} ${y})`);

    leavesGroup.appendChild(leaf);
}// 뿌리 추가 
함수
function addRoots(count) {
    if (!branchesGroup) return;

    const trunkX = parseFloat(trunkElement.getAttribute('x') || '145');
    const trunkWidth = parseFloat(trunkElement.getAttribute('width') || '10');
    const centerX = trunkX + trunkWidth / 2;

    for (let i = 0; i < count; i++) {
        const rootPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const startX = centerX + (Math.random() * trunkWidth - trunkWidth / 2);
        const startY = 380;

        // 뿌리 곡선 생성
        const controlX1 = startX + (Math.random() * 30 - 15);
        const controlY1 = startY + Math.random() * 5;
        const controlX2 = startX + (Math.random() * 40 - 20);
        const controlY2 = startY + 5 + Math.random() * 5;
        const endX = startX + (Math.random() * 50 - 25);
        const endY = startY + 10 + Math.random() * 5;

        rootPath.setAttribute('d', `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`);
        rootPath.setAttribute('stroke', '#5D4037');
        rootPath.setAttribute('stroke-width', 1 + Math.random() * 2);
        rootPath.setAttribute('fill', 'none');

        branchesGroup.appendChild(rootPath);
    }
}

// 꽃 추가 함수
function addFlowers(count) {
    if (!fruitsGroup) return;

    const leaves = leavesGroup.querySelectorAll('.leaf');
    if (leaves.length === 0) return;

    const leafPositions = Array.from(leaves).map(leaf => ({
        x: parseFloat(leaf.getAttribute('cx') || leaf.getAttribute('x') || '0'),
        y: parseFloat(leaf.getAttribute('cy') || leaf.getAttribute('y') || '0')
    }));

    // 꽃 색상 배열
    const flowerColors = ['#F8BBD0', '#E1BEE7', '#FFCDD2', '#F0F4C3', '#B3E5FC'];

    for (let i = 0; i < Math.min(count, leafPositions.length); i++) {
        const position = leafPositions[Math.floor(Math.random() * leafPositions.length)];
        const flowerColor = flowerColors[Math.floor(Math.random() * flowerColors.length)];
        const size = 3 + Math.random() * 3;

        // 꽃 그룹 생성
        const flower = document.createElementNS('http://www.w3.org/2000/svg', 'g');

        // 꽃잎 생성
        for (let j = 0; j < 5; j++) {
            const angle = j * 72; // 360 / 5 = 72도
            const petalX = position.x + size * Math.cos(angle * Math.PI / 180);
            const petalY = position.y + size * Math.sin(angle * Math.PI / 180);

            const petal = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            petal.setAttribute('cx', petalX);
            petal.setAttribute('cy', petalY);
            petal.setAttribute('r', size);
            petal.setAttribute('fill', flowerColor);

            flower.appendChild(petal);
        }

        // 꽃 중앙
        const center = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        center.setAttribute('cx', position.x);
        center.setAttribute('cy', position.y);
        center.setAttribute('r', size * 0.7);
        center.setAttribute('fill', '#FFEB3B');

        flower.appendChild(center);
        flower.setAttribute('class', 'flower');

        fruitsGroup.appendChild(flower);
    }
}

// 새 추가 함수
function addBirds(count) {
    if (!lightEffectsGroup) return;

    for (let i = 0; i < count; i++) {
        const x = 50 + Math.random() * 200;
        const y = 100 + Math.random() * 200;

        const bird = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        bird.setAttribute('x', x);
        bird.setAttribute('y', y);
        bird.setAttribute('font-size', '15');
        bird.textContent = '🐦';
        bird.setAttribute('class', 'bird');

        lightEffectsGroup.appendChild(bird);
    }
}

// 나비 추가 함수
function addButterflies(count) {
    if (!lightEffectsGroup) return;

    for (let i = 0; i < count; i++) {
        const x = 50 + Math.random() * 200;
        const y = 100 + Math.random() * 200;

        const butterfly = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        butterfly.setAttribute('x', x);
        butterfly.setAttribute('y', y);
        butterfly.setAttribute('font-size', '15');
        butterfly.textContent = '🦋';
        butterfly.setAttribute('class', 'butterfly');

        lightEffectsGroup.appendChild(butterfly);
    }
}

// 무지개 추가 함수
function addRainbow() {
    if (!lightEffectsGroup) return;

    const rainbow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    rainbow.setAttribute('d', 'M 0,200 C 100,100 200,100 300,200');
    rainbow.setAttribute('stroke-width', '20');
    rainbow.setAttribute('stroke', '#F44336');
    rainbow.setAttribute('fill', 'none');
    rainbow.setAttribute('opacity', '0.3');
    rainbow.setAttribute('class', 'rainbow-arc');

    const rainbow2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    rainbow2.setAttribute('d', 'M 0,200 C 100,100 200,100 300,200');
    rainbow2.setAttribute('stroke-width', '15');
    rainbow2.setAttribute('stroke', '#FF9800');
    rainbow2.setAttribute('fill', 'none');
    rainbow2.setAttribute('opacity', '0.3');
    rainbow2.setAttribute('class', 'rainbow-arc');

    const rainbow3 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    rainbow3.setAttribute('d', 'M 0,200 C 100,100 200,100 300,200');
    rainbow3.setAttribute('stroke-width', '10');
    rainbow3.setAttribute('stroke', '#FFEB3B');
    rainbow3.setAttribute('fill', 'none');
    rainbow3.setAttribute('opacity', '0.3');
    rainbow3.setAttribute('class', 'rainbow-arc');

    const rainbow4 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    rainbow4.setAttribute('d', 'M 0,200 C 100,100 200,100 300,200');
    rainbow4.setAttribute('stroke-width', '5');
    rainbow4.setAttribute('stroke', '#4CAF50');
    rainbow4.setAttribute('fill', 'none');
    rainbow4.setAttribute('opacity', '0.3');
    rainbow4.setAttribute('class', 'rainbow-arc');

    lightEffectsGroup.appendChild(rainbow);
    lightEffectsGroup.appendChild(rainbow2);
    lightEffectsGroup.appendChild(rainbow3);
    lightEffectsGroup.appendChild(rainbow4);
}

// 별 추가 함수
function addStars(count) {
    if (!lightEffectsGroup) return;

    for (let i = 0; i < count; i++) {
        const x = Math.random() * 300;
        const y = Math.random() * 200;
        const size = 1 + Math.random() * 3;

        const star = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        star.setAttribute('cx', x);
        star.setAttribute('cy', y);
        star.setAttribute('r', size);
        star.setAttribute('fill', '#FFEB3B');
        star.setAttribute('class', 'star');
        star.setAttribute('filter', 'url(#glow)');

        lightEffectsGroup.appendChild(star);
    }
}

// 오라 효과 추가 함수
function addAura() {
    if (!lightEffectsGroup || !trunkElement) return;

    const trunkX = parseFloat(trunkElement.getAttribute('x') || '145');
    const trunkWidth = parseFloat(trunkElement.getAttribute('width') || '10');
    const trunkY = parseFloat(trunkElement.getAttribute('y') || '320');
    const trunkHeight = parseFloat(trunkElement.getAttribute('height') || '60');

    const centerX = trunkX + trunkWidth / 2;
    const centerY = trunkY + trunkHeight / 2;

    // 오라 효과 (동심원)
    for (let i = 0; i < 3; i++) {
        const radius = 50 + i * 30;
        const aura = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        aura.setAttribute('cx', centerX);
        aura.setAttribute('cy', centerY);
        aura.setAttribute('r', radius);
        aura.setAttribute('fill', 'none');
        aura.setAttribute('stroke', `rgba(255, 215, 0, ${0.3 - i * 0.1})`);
        aura.setAttribute('stroke-width', '5');
        aura.setAttribute('class', 'aura');

        lightEffectsGroup.appendChild(aura);
    }
}

// 다각형 잎 생성 함수
function createPolygonLeaf(x, y, size, color) {
    if (!leavesGroup) return;

    // 잎 모양 다각형 생성
    const leaf = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    // 잎 모양 종류 (0: 타원형, 1: 하트형, 2: 별모양, 3: 단풍잎)
    const leafType = Math.floor(Math.random() * 4);

    let pathData = '';

    switch (leafType) {
        case 0: // 타원형 잎
            const angle = Math.random() * 360;
            pathData = `M ${x} ${y - size} 
                       C ${x + size} ${y - size}, ${x + size} ${y + size}, ${x} ${y + size} 
                       C ${x - size} ${y + size}, ${x - size} ${y - size}, ${x} ${y - size}`;
            break;

        case 1: // 하트형 잎
            pathData = `M ${x} ${y + size * 0.7} 
                       C ${x + size * 0.7} ${y}, ${x + size * 0.5} ${y - size * 0.5}, ${x} ${y - size * 0.7} 
                       C ${x - size * 0.5} ${y - size * 0.5}, ${x - size * 0.7} ${y}, ${x} ${y + size * 0.7}`;
            break;

        case 2: // 별모양 잎
            const points = 5;
            const outerRadius = size;
            const innerRadius = size * 0.4;

            for (let i = 0; i < points * 2; i++) {
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const angle = (i * Math.PI) / points;
                const pointX = x + radius * Math.sin(angle);
                const pointY = y - radius * Math.cos(angle);

                pathData += (i === 0 ? 'M ' : 'L ') + pointX + ' ' + pointY + ' ';
            }
            pathData += 'Z';
            break;

        case 3: // 단풍잎 모양
            pathData = `M ${x} ${y - size} 
                       L ${x + size * 0.3} ${y - size * 0.3} 
                       L ${x + size} ${y - size * 0.5} 
                       L ${x + size * 0.5} ${y} 
                       L ${x + size * 0.8} ${y + size * 0.8} 
                       L ${x} ${y + size * 0.5} 
                       L ${x - size * 0.8} ${y + size * 0.8} 
                       L ${x - size * 0.5} ${y} 
                       L ${x - size} ${y - size * 0.5} 
                       L ${x - size * 0.3} ${y - size * 0.3} 
                       Z`;
            break;
    }

    leaf.setAttribute('d', pathData);
    leaf.setAttribute('fill', color);
    leaf.setAttribute('class', 'leaf');

    // 약간의 회전 추가
    const rotation = Math.random() * 360;
    leaf.setAttribute('transform', `rotate(${rotation} ${x} ${y})`);

    leavesGroup.appendChild(leaf);
}// 수입 알림 표시 함수
function showIncomeNotification(amount) {
    // 수입 알림 요소 생성
    const notification = document.createElement('div');
    notification.className = 'income-notification';

    notification.innerHTML = `
        <div class="income-icon">💰</div>
        <div class="income-content">
            <h4>수입 발생!</h4>
            <p>+${amount.toLocaleString()}원</p>
        </div>
    `;

    document.body.appendChild(notification);

    // 사운드 재생
    playSound(storySound);

    // 3초 후 알림 제거
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}// 수입 카운트다운 표시 함수
function updateIncomeCountdown() {
    // 카운트다운 요소가 없으면 생성
    let countdownElement = document.getElementById('income-countdown');
    if (!countdownElement) {
        countdownElement = document.createElement('div');
        countdownElement.id = 'income-countdown';
        countdownElement.className = 'income-countdown';
        document.body.appendChild(countdownElement);
    }

    // 남은 시간 계산 (초 단위)
    const now = Date.now();
    const incomeInterval = 10000; // 10초 (밀리초 단위)
    const timeElapsed = now - gameState.lastIncomeTime;
    const timeRemaining = Math.max(0, incomeInterval - timeElapsed);
    const secondsRemaining = Math.ceil(timeRemaining / 1000);

    // 카운트다운 텍스트 업데이트
    countdownElement.textContent = `다음 수입까지: ${secondsRemaining}초`;

    // 시간이 다 되면 카운트다운 숨기기
    if (secondsRemaining <= 0) {
        countdownElement.style.display = 'none';
    } else {
        countdownElement.style.display = 'block';
    }
}// 개선된 나무 가지 업데이트 함수
function createNaturalBranches(count) {
    if (!branchesGroup || !trunkElement) return;

    branchesGroup.innerHTML = '';

    const trunkX = parseFloat(trunkElement.getAttribute('x') || '145');
    const trunkWidth = parseFloat(trunkElement.getAttribute('width') || '10');
    const trunkY = parseFloat(trunkElement.getAttribute('y') || '320');
    const trunkHeight = parseFloat(trunkElement.getAttribute('height') || '60');

    const centerX = trunkX + trunkWidth / 2;

    // 줄기 상단 위치
    const trunkTop = trunkY;

    // 줄기 자체를 더 자연스럽게 만들기
    const mainTrunk = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    // 줄기가 약간 구부러지도록 설정
    const trunkCurveOffset = Math.random() * 10 - 5; // -5에서 5 사이의 랜덤값
    const trunkControlX = centerX + trunkCurveOffset;
    const trunkControlY = trunkY + trunkHeight * 0.5;

    mainTrunk.setAttribute('d', `M ${centerX} ${trunkY + trunkHeight} Q ${trunkControlX} ${trunkControlY} ${centerX} ${trunkY}`);
    mainTrunk.setAttribute('stroke', '#5D4037');
    mainTrunk.setAttribute('stroke-width', trunkWidth);
    mainTrunk.setAttribute('fill', 'none');
    mainTrunk.setAttribute('stroke-linecap', 'round');

    branchesGroup.appendChild(mainTrunk);

    // 메인 가지 생성 - 더 자연스러운 분포로
    for (let i = 0; i < count; i++) {
        // 가지 시작 위치를 줄기 상단에 더 집중
        const branchY = trunkY + (i < count / 3 ?
            trunkHeight * 0.1 + (i / count) * trunkHeight * 0.3 : // 상단 1/3은 위쪽에 집중
            trunkHeight * 0.3 + ((i - count / 3) / count) * trunkHeight * 0.6); // 나머지는 고르게 분포

        // 가지 길이 - 상단 가지가 더 길게
        const lengthFactor = i < count / 3 ? 1.5 : 1.0;
        const length = (20 + Math.random() * 40) * lengthFactor;

        // 가지 두께 - 하단 가지가 더 두껍게
        const thicknessFactor = i < count / 3 ? 0.8 : 1.2;
        const thickness = (2 + Math.random() * 4) * thicknessFactor;

        // 가지 각도 - 상단은 더 수직적으로, 하단은 더 수평적으로
        const angleBase = i < count / 3 ? 60 : 30;
        const angle = (i % 2 === 0) ?
            -angleBase - Math.random() * 20 :
            angleBase + Math.random() * 20;

        // 곡선 가지 생성 - 더 자연스러운 곡선
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

        // 가지의 끝점 계산
        const endX = centerX + length * Math.cos(angle * Math.PI / 180);
        const endY = branchY - length * Math.sin(angle * Math.PI / 180);

        // 제어점 계산 - 더 자연스러운 곡선을 위해 여러 제어점 사용
        const controlX1 = centerX + (length * 0.3) * Math.cos((angle + (angle > 0 ? -10 : 10)) * Math.PI / 180);
        const controlY1 = branchY - (length * 0.3) * Math.sin((angle + (angle > 0 ? 10 : -10)) * Math.PI / 180);

        const controlX2 = centerX + (length * 0.7) * Math.cos((angle + (angle > 0 ? -5 : 5)) * Math.PI / 180);
        const controlY2 = branchY - (length * 0.7) * Math.sin((angle + (angle > 0 ? 5 : -5)) * Math.PI / 180);

        // 곡선 경로 설정 - 3차 베지어 곡선 사용
        path.setAttribute('d', `M ${centerX} ${branchY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`);

        // 가지 색상 - 위치에 따라 약간 다른 색상
        const branchColor = i < count / 3 ? '#8D6E63' : '#795548';
        path.setAttribute('stroke', branchColor);
        path.setAttribute('stroke-width', thickness);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-linecap', 'round');

        branchesGroup.appendChild(path);

        // 작은 가지 추가 - 더 많은 작은 가지
        const smallBranchCount = Math.floor(Math.random() * 3) + 1; // 1~3개의 작은 가지

        for (let j = 0; j < smallBranchCount; j++) {
            if (length > 20) { // 충분히 긴 가지에만 작은 가지 추가
                const smallBranchLength = length * (0.3 + Math.random() * 0.3); // 30~60% 길이
                const smallBranchThickness = thickness * (0.4 + Math.random() * 0.3); // 40~70% 두께

                // 작은 가지 각도 - 메인 가지에서 더 자연스럽게 뻗어나가도록
                const smallBranchAngle = angle + (Math.random() * 60 - 30);

                // 작은 가지 시작점 - 메인 가지의 다양한 위치에서 시작
                const branchPosition = 0.3 + Math.random() * 0.6; // 30~90% 위치
                const startSmallX = centerX + (length * branchPosition) * Math.cos(angle * Math.PI / 180);
                const startSmallY = branchY - (length * branchPosition) * Math.sin(angle * Math.PI / 180);

                const smallPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');

                // 작은 가지 끝점
                const endSmallX = startSmallX + smallBranchLength * Math.cos(smallBranchAngle * Math.PI / 180);
                const endSmallY = startSmallY - smallBranchLength * Math.sin(smallBranchAngle * Math.PI / 180);

                // 작은 가지 제어점
                const controlSmallX = startSmallX + (smallBranchLength * 0.5) * Math.cos((smallBranchAngle + (smallBranchAngle > 0 ? -10 : 10)) * Math.PI / 180);
                const controlSmallY = startSmallY - (smallBranchLength * 0.5) * Math.sin((smallBranchAngle + (smallBranchAngle > 0 ? 10 : -10)) * Math.PI / 180);

                smallPath.setAttribute('d', `M ${startSmallX} ${startSmallY} Q ${controlSmallX} ${controlSmallY} ${endSmallX} ${endSmallY}`);
                smallPath.setAttribute('stroke', '#A1887F');
                smallPath.setAttribute('stroke-width', smallBranchThickness);
                smallPath.setAttribute('fill', 'none');
                smallPath.setAttribute('stroke-linecap', 'round');

                branchesGroup.appendChild(smallPath);
            }
        }
    }
}

// 개선된 잎 생성 함수
function createNaturalLeaves(count) {
    if (!leavesGroup || !trunkElement) return;

    leavesGroup.innerHTML = '';

    const trunkX = parseFloat(trunkElement.getAttribute('x') || '145');
    const trunkWidth = parseFloat(trunkElement.getAttribute('width') || '10');
    const trunkY = parseFloat(trunkElement.getAttribute('y') || '320');

    const centerX = trunkX + trunkWidth / 2;

    // 나무 성장도에 따라 잎 분포 조정
    const maxDistance = 30 + Math.min(100, gameState.treeGrowth / 1000);

    // 잎 그룹 생성 (가지 주변에 집중)
    const branchElements = branchesGroup.querySelectorAll('path');

    if (branchElements.length > 0) {
        // 가지가 있는 경우 가지 주변에 잎 배치
        branchElements.forEach(branch => {
            // 가지 경로를 따라 여러 지점에 잎 배치
            const pathLength = branch.getTotalLength();

            // 가지 끝 부분에 더 많은 잎 배치
            const leafCount = Math.floor(count / branchElements.length);

            for (let i = 0; i < leafCount; i++) {
                // 가지 끝 부분에 더 많은 잎이 오도록 분포 조정
                const position = Math.pow(Math.random(), 2); // 제곱하여 1에 가까운 값이 더 많이 나오도록
                const point = branch.getPointAtLength(pathLength * (0.5 + position * 0.5)); // 가지의 50~100% 위치

                // 가지 주변에 잎 클러스터 생성
                createLeafCluster(point.x, point.y, Math.floor(Math.random() * 3) + 1);
            }
        });
    } else {
        // 가지가 없는 경우 줄기 주변에 잎 배치
        for (let i = 0; i < count; i++) {
            const radius = 8 + Math.random() * 12;
            const angle = Math.random() * 360;
            const distance = 20 + Math.random() * maxDistance;

            const x = centerX + distance * Math.cos(angle * Math.PI / 180);
            const y = trunkY + 50 - distance * Math.sin(angle * Math.PI / 180);

            createLeaf(x, y, radius, radius * 1.5, getLeafColor(gameState.treeGrowth));
        }
    }
}// 큰 둥근 나무 생성 함수 (이미지 참조)
function createBigRoundTree() {
    if (!trunkElement || !branchesGroup || !leavesGroup || !fruitsGroup) return;

    // 기존 요소 초기화
    clearTreeElements();

    // 줄기 크기 및 위치 조정
    trunkElement.setAttribute('x', '130');
    trunkElement.setAttribute('y', '180');
    trunkElement.setAttribute('width', '40');
    trunkElement.setAttribute('height', '200');
    trunkElement.setAttribute('fill', '#8B4513');

    // 뿌리 추가
    const roots = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    roots.innerHTML = `
        <path d="M 130,380 Q 110,390 90,395" stroke="#8B4513" stroke-width="8" fill="none" />
        <path d="M 170,380 Q 190,390 210,395" stroke="#8B4513" stroke-width="8" fill="none" />
        <path d="M 140,380 Q 130,390 120,400" stroke="#8B4513" stroke-width="6" fill="none" />
        <path d="M 160,380 Q 170,390 180,400" stroke="#8B4513" stroke-width="6" fill="none" />
    `;
    branchesGroup.appendChild(roots);

    // 주요 가지 추가
    const mainBranches = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    mainBranches.innerHTML = `
        <path d="M 150,200 Q 100,150 80,140" stroke="#8B4513" stroke-width="7" fill="none" />
        <path d="M 150,220 Q 90,200 60,190" stroke="#8B4513" stroke-width="6" fill="none" />
        <path d="M 150,240 Q 110,230 90,240" stroke="#8B4513" stroke-width="5" fill="none" />
        
        <path d="M 150,200 Q 200,150 220,140" stroke="#8B4513" stroke-width="7" fill="none" />
        <path d="M 150,220 Q 210,200 240,190" stroke="#8B4513" stroke-width="6" fill="none" />
        <path d="M 150,240 Q 190,230 210,240" stroke="#8B4513" stroke-width="5" fill="none" />
        
        <path d="M 150,180 Q 140,150 130,120" stroke="#8B4513" stroke-width="6" fill="none" />
        <path d="M 150,180 Q 160,150 170,120" stroke="#8B4513" stroke-width="6" fill="none" />
        <path d="M 150,160 Q 150,140 150,100" stroke="#8B4513" stroke-width="7" fill="none" />
    `;
    branchesGroup.appendChild(mainBranches);

    // 작은 가지 추가
    const smallBranches = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    smallBranches.innerHTML = `
        <path d="M 80,140 Q 70,130 60,135" stroke="#8B4513" stroke-width="3" fill="none" />
        <path d="M 80,140 Q 75,125 80,115" stroke="#8B4513" stroke-width="3" fill="none" />
        
        <path d="M 60,190 Q 50,185 40,190" stroke="#8B4513" stroke-width="3" fill="none" />
        <path d="M 60,190 Q 55,175 50,170" stroke="#8B4513" stroke-width="3" fill="none" />
        
        <path d="M 90,240 Q 80,245 70,240" stroke="#8B4513" stroke-width="3" fill="none" />
        <path d="M 90,240 Q 85,255 75,260" stroke="#8B4513" stroke-width="3" fill="none" />
        
        <path d="M 220,140 Q 230,130 240,135" stroke="#8B4513" stroke-width="3" fill="none" />
        <path d="M 220,140 Q 225,125 220,115" stroke="#8B4513" stroke-width="3" fill="none" />
        
        <path d="M 240,190 Q 250,185 260,190" stroke="#8B4513" stroke-width="3" fill="none" />
        <path d="M 240,190 Q 245,175 250,170" stroke="#8B4513" stroke-width="3" fill="none" />
        
        <path d="M 210,240 Q 220,245 230,240" stroke="#8B4513" stroke-width="3" fill="none" />
        <path d="M 210,240 Q 215,255 225,260" stroke="#8B4513" stroke-width="3" fill="none" />
        
        <path d="M 130,120 Q 120,110 110,115" stroke="#8B4513" stroke-width="3" fill="none" />
        <path d="M 130,120 Q 125,100 130,90" stroke="#8B4513" stroke-width="3" fill="none" />
        
        <path d="M 170,120 Q 180,110 190,115" stroke="#8B4513" stroke-width="3" fill="none" />
        <path d="M 170,120 Q 175,100 170,90" stroke="#8B4513" stroke-width="3" fill="none" />
        
        <path d="M 150,100 Q 140,90 130,85" stroke="#8B4513" stroke-width="3" fill="none" />
        <path d="M 150,100 Q 160,90 170,85" stroke="#8B4513" stroke-width="3" fill="none" />
        <path d="M 150,100 Q 150,80 150,70" stroke="#8B4513" stroke-width="3" fill="none" />
    `;
    branchesGroup.appendChild(smallBranches);

    // 잎 생성 (둥근 형태)
    createRoundLeafCanopy();

    // 열매 추가
    addFruits(20);

    // 빛 효과 추가
    addLightEffects(15);
}

// 둥근 형태의 잎 캐노피 생성
function createRoundLeafCanopy() {
    if (!leavesGroup) return;

    // 잎 색상 그라데이션
    const leafColors = ['#4CAF50', '#66BB6A', '#81C784', '#A5D6A7', '#C8E6C9'];

    // 중심점
    const centerX = 150;
    const centerY = 150;

    // 큰 원형 캐노피 생성
    for (let i = 0; i < 300; i++) {
        // 랜덤 각도
        const angle = Math.random() * 360;

        // 거리는 중심에서 멀어질수록 확률이 낮아지도록 설정
        const distanceMax = 120;
        const distance = Math.pow(Math.random(), 0.5) * distanceMax;

        // 위치 계산
        const x = centerX + distance * Math.cos(angle * Math.PI / 180);
        const y = centerY + distance * Math.sin(angle * Math.PI / 180);

        // 잎 크기는 중심에 가까울수록 작게
        const size = 5 + (distance / distanceMax) * 10;

        // 랜덤 색상 선택
        const color = leafColors[Math.floor(Math.random() * leafColors.length)];

        // 잎 생성
        if (Math.random() > 0.3) {
            createLeaf(x, y, size, size * 1.2, color);
        } else {
            createPolygonLeaf(x, y, size, color);
        }
    }
}

// 기존 updateTreeAppearance 함수 수정
const originalUpdateTreeAppearance = updateTreeAppearance;
updateTreeAppearance = function (stage) {
    if (stage >= 5) {
        // 5단계 이상이면 큰 둥근 나무로 표현
        createBigRoundTree();
    } else {
        // 그 이하는 기존 함수 사용
        originalUpdateTreeAppearance(stage);
    }
}