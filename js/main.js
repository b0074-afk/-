/**
 * 골드런 승마랜드 - 메인 JavaScript
 * 예약 시스템, 노쇼 방지, 긴급 슬롯 알림
 * Author: Claude AI
 * Last Updated: 2026-01-04
 */

// ========================================
// 1. 전역 상태 관리
// ========================================

const AppState = {
    currentUser: null,
    bookings: [],
    urgentSlots: [],
    horses: [
        { id: 1, name: '골드런', suitable: true, status: 'available' },
        { id: 2, name: '썬더', suitable: true, status: 'available' },
        { id: 3, name: '스타', suitable: false, status: 'available' },
        { id: 4, name: '루비', suitable: true, status: 'maintenance' },
        { id: 5, name: '다이아', suitable: true, status: 'available' }
    ],
    coaches: [
        { id: 1, name: '김코치', specialty: '초급', available: true },
        { id: 2, name: '이코치', specialty: '중급', available: true },
        { id: 3, name: '박코치', specialty: '고급', available: false }
    ],
    timeSlots: [
        '09:00', '10:00', '11:00', '12:00', 
        '13:00', '14:00', '15:00', '16:00', '17:00'
    ]
};

// ========================================
// 2. DOM 준비 완료 이벤트
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🐴 골드런 승마랜드 시스템 시작');
    
    initializeApp();
    setupEventListeners();
    loadUserData();
    checkUrgentSlots();
});

// ========================================
// 3. 앱 초기화
// ========================================

function initializeApp() {
    // 모바일 메뉴 토글
    setupMobileMenu();
    
    // 스크롤 애니메이션
    setupScrollAnimations();
    
    // 날씨 정보 로드
    loadWeatherInfo();
    
    // 현재 시간 표시
    updateCurrentTime();
    setInterval(updateCurrentTime, 60000); // 1분마다 업데이트
}

// ========================================
// 4. 이벤트 리스너 설정
// ========================================

function setupEventListeners() {
    // 예약 폼
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
    }
    
    // 시간 슬롯 선택
    const timeSlots = document.querySelectorAll('.time-slot');
    timeSlots.forEach(slot => {
        slot.addEventListener('click', handleTimeSlotClick);
    });
    
    // 역할 선택 (대시보드)
    const roleButtons = document.querySelectorAll('.role-button');
    roleButtons.forEach(button => {
        button.addEventListener('click', handleRoleSwitch);
    });
    
    // 네비게이션 링크
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
}

// ========================================
// 5. 모바일 메뉴
// ========================================

function setupMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            
            // 햄버거 아이콘 애니메이션
            const spans = menuToggle.querySelectorAll('span');
            spans[0].style.transform = navMenu.classList.contains('active') 
                ? 'rotate(45deg) translateY(8px)' 
                : 'none';
            spans[1].style.opacity = navMenu.classList.contains('active') ? '0' : '1';
            spans[2].style.transform = navMenu.classList.contains('active') 
                ? 'rotate(-45deg) translateY(-8px)' 
                : 'none';
        });
    }
}

// ========================================
// 6. 스크롤 애니메이션
// ========================================

function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    // 애니메이션 대상 요소 관찰
    const animatedElements = document.querySelectorAll('.card, .education-card, .menu-item');
    animatedElements.forEach(el => observer.observe(el));
}

// ========================================
// 7. 예약 시스템
// ========================================

async function handleBookingSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const bookingData = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        date: formData.get('date'),
        timeSlot: formData.get('timeSlot'),
        horseId: formData.get('horse'),
        coachId: formData.get('coach'),
        type: formData.get('bookingType'),
        specialRequests: formData.get('specialRequests')
    };
    
    // 유효성 검사
    if (!validateBooking(bookingData)) {
        showNotification('error', '예약 오류', '모든 필수 항목을 입력해주세요.');
        return;
    }
    
    // 로딩 표시
    showLoader();
    
    try {
        // API 호출 (시뮬레이션)
        await simulateAPICall(bookingData);
        
        // 예약 성공
        showNotification('success', '예약 완료!', 
            `${bookingData.date} ${bookingData.timeSlot}에 예약되었습니다. SMS가 발송되었습니다.`);
        
        // 알림 스케줄링
        scheduleNotifications(bookingData);
        
        // 폼 초기화
        e.target.reset();
        
        // 대시보드로 이동 (선택사항)
        setTimeout(() => {
            // window.location.href = '/dashboard.html';
        }, 2000);
        
    } catch (error) {
        showNotification('error', '예약 실패', '예약 중 오류가 발생했습니다. 다시 시도해주세요.');
        console.error('Booking error:', error);
    } finally {
        hideLoader();
    }
}

function validateBooking(data) {
    return data.name && data.phone && data.date && data.timeSlot;
}

async function simulateAPICall(data) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('📝 예약 데이터:', data);
            AppState.bookings.push({
                id: Date.now(),
                ...data,
                status: 'confirmed',
                createdAt: new Date().toISOString()
            });
            resolve();
        }, 1500);
    });
}

// ========================================
// 8. 노쇼 방지 알림 스케줄
// ========================================

function scheduleNotifications(booking) {
    const bookingDate = new Date(booking.date + ' ' + booking.timeSlot);
    const now = new Date();
    
    // 24시간 전 알림
    const reminder24h = new Date(bookingDate.getTime() - 24 * 60 * 60 * 1000);
    if (reminder24h > now) {
        console.log('⏰ 24시간 전 알림 설정:', reminder24h);
        // 실제로는 서버에서 SMS 발송 스케줄링
    }
    
    // 2시간 전 알림
    const reminder2h = new Date(bookingDate.getTime() - 2 * 60 * 60 * 1000);
    if (reminder2h > now) {
        console.log('⏰ 2시간 전 알림 설정:', reminder2h);
    }
    
    // 노쇼 체크 (예약 시간 1시간 후)
    const noShowCheck = new Date(bookingDate.getTime() + 60 * 60 * 1000);
    console.log('🚫 노쇼 체크 설정:', noShowCheck);
}

// ========================================
// 9. 긴급 슬롯 시스템
// ========================================

async function checkUrgentSlots() {
    try {
        // API에서 긴급 슬롯 조회 (시뮬레이션)
        const urgentSlots = await fetchUrgentSlots();
        
        if (urgentSlots.length > 0) {
            AppState.urgentSlots = urgentSlots;
            showUrgentSlotNotification(urgentSlots[0]);
        }
        
    } catch (error) {
        console.error('긴급 슬롯 조회 오류:', error);
    }
    
    // 5분마다 체크
    setTimeout(checkUrgentSlots, 5 * 60 * 1000);
}

async function fetchUrgentSlots() {
    // 실제로는 API 호출
    return new Promise((resolve) => {
        setTimeout(() => {
            // 시뮬레이션: 랜덤으로 긴급 슬롯 생성
            const hasUrgentSlot = Math.random() > 0.9; // 10% 확률
            
            if (hasUrgentSlot) {
                resolve([{
                    id: Date.now(),
                    date: new Date().toISOString().split('T')[0],
                    timeSlot: '14:00',
                    reason: '학교승마 취소',
                    availableUntil: new Date(Date.now() + 30 * 60 * 1000).toISOString()
                }]);
            } else {
                resolve([]);
            }
        }, 500);
    });
}

function showUrgentSlotNotification(slot) {
    const message = `
        🔔 긴급 슬롯 알림!
        
        ${slot.date} ${slot.timeSlot}
        사유: ${slot.reason}
        
        선착순 예약 가능! (30분 내)
    `;
    
    showNotification('warning', '긴급 슬롯 발생!', message, 10000);
    
    // 소리 알림 (선택사항)
    playNotificationSound();
}

// ========================================
// 10. 시간 슬롯 선택
// ========================================

function handleTimeSlotClick(e) {
    const slot = e.currentTarget;
    
    // 비활성화된 슬롯은 클릭 불가
    if (slot.classList.contains('disabled')) {
        showNotification('warning', '예약 불가', '이미 예약된 시간입니다.');
        return;
    }
    
    // 이전 선택 해제
    document.querySelectorAll('.time-slot').forEach(s => {
        s.classList.remove('selected');
    });
    
    // 현재 슬롯 선택
    slot.classList.add('selected');
    
    // 숨겨진 입력 필드 업데이트
    const timeInput = document.getElementById('selectedTime');
    if (timeInput) {
        timeInput.value = slot.dataset.time;
    }
}

// ========================================
// 11. 역할 전환 (대시보드)
// ========================================

function handleRoleSwitch(e) {
    const button = e.currentTarget;
    const role = button.dataset.role;
    
    // 모든 버튼 비활성화
    document.querySelectorAll('.role-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 현재 버튼 활성화
    button.classList.add('active');
    
    // 대시보드 콘텐츠 변경
    updateDashboardContent(role);
}

function updateDashboardContent(role) {
    console.log('🔄 역할 전환:', role);
    
    const content = document.getElementById('dashboardContent');
    if (!content) return;
    
    // 역할별 대시보드 콘텐츠
    const dashboards = {
        member: generateMemberDashboard(),
        student: generateStudentDashboard(),
        coach: generateCoachDashboard(),
        admin: generateAdminDashboard()
    };
    
    content.innerHTML = dashboards[role] || dashboards.member;
    
    // 차트 초기화 (있는 경우)
    initializeCharts();
}

// ========================================
// 12. 대시보드 HTML 생성
// ========================================

function generateMemberDashboard() {
    return `
        <div class="dashboard-grid">
            <div class="stat-card">
                <div class="stat-label">이번 달 출석</div>
                <div class="stat-value">8회</div>
                <div class="stat-change positive">+2 지난달 대비</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-label">출석률</div>
                <div class="stat-value">85%</div>
                <div class="stat-change positive">+5%</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-label">다음 예약</div>
                <div class="stat-value">2일 후</div>
                <div class="stat-change">2026-01-06 14:00</div>
            </div>
            
            <div class="card">
                <h3>내 예약 내역</h3>
                <div class="booking-list">
                    <div class="booking-item">
                        <div class="booking-date">2026-01-06 14:00</div>
                        <div class="booking-horse">말: 골드런 | 코치: 김코치</div>
                        <span class="badge bg-success">확정</span>
                    </div>
                    <div class="booking-item">
                        <div class="booking-date">2026-01-03 10:00</div>
                        <div class="booking-horse">말: 썬더 | 코치: 이코치</div>
                        <span class="badge bg-gray">완료</span>
                    </div>
                </div>
            </div>
            
            <div class="card qr-container">
                <h3>출석 QR 코드</h3>
                <div class="qr-code">
                    <div style="font-size: 4rem;">📱</div>
                </div>
                <p>코치에게 스캔해주세요</p>
            </div>
        </div>
    `;
}

function generateStudentDashboard() {
    return `
        <div class="dashboard-grid">
            <div class="widget">
                <div class="widget-title">호스피아 연동 상태</div>
                <div class="widget-value">✓ 연동됨</div>
                <div class="widget-subtitle">학교승마체험 프로그램</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-label">출석 현황</div>
                <div class="stat-value">7/10회</div>
                <div class="stat-change">70% 완료</div>
            </div>
            
            <div class="card">
                <h3>다음 수업</h3>
                <div class="class-info">
                    <p><strong>일시:</strong> 2026-01-06 (월) 15:00</p>
                    <p><strong>코치:</strong> 김코치</p>
                    <p><strong>말:</strong> 골드런</p>
                    <button class="btn btn-primary mt-3">수업 확인</button>
                </div>
            </div>
            
            <div class="card">
                <h3>학습 진도</h3>
                <div class="progress-list">
                    <div class="progress-item">
                        <span>기초 자세</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 100%"></div>
                        </div>
                    </div>
                    <div class="progress-item">
                        <span>평보</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 80%"></div>
                        </div>
                    </div>
                    <div class="progress-item">
                        <span>속보</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 40%"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function generateCoachDashboard() {
    return `
        <div class="dashboard-grid">
            <div class="stat-card">
                <div class="stat-label">오늘의 수업</div>
                <div class="stat-value">5건</div>
                <div class="stat-change">3건 완료 / 2건 예정</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-label">담당 학생</div>
                <div class="stat-value">24명</div>
                <div class="stat-change">이번 달</div>
            </div>
            
            <div class="card">
                <h3>오늘의 스케줄</h3>
                <div class="schedule-list">
                    <div class="schedule-item completed">
                        <span class="time">09:00</span>
                        <span class="student">김민준 (초급)</span>
                        <span class="badge bg-success">완료</span>
                    </div>
                    <div class="schedule-item completed">
                        <span class="time">10:00</span>
                        <span class="student">이서연 (중급)</span>
                        <span class="badge bg-success">완료</span>
                    </div>
                    <div class="schedule-item pending">
                        <span class="time">14:00</span>
                        <span class="student">박지호 (초급)</span>
                        <span class="badge bg-warning">예정</span>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <h3>말 배정 현황</h3>
                <div class="horse-list">
                    ${AppState.horses.map(horse => `
                        <div class="horse-item">
                            <span class="horse-name">🐴 ${horse.name}</span>
                            <span class="badge ${horse.status === 'available' ? 'bg-success' : 'bg-warning'}">
                                ${horse.status === 'available' ? '사용 가능' : '점검 중'}
                            </span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function generateAdminDashboard() {
    return `
        <div class="dashboard-grid">
            <div class="stat-card">
                <div class="stat-label">오늘 매출</div>
                <div class="stat-value">₩450,000</div>
                <div class="stat-change positive">+12% 어제 대비</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-label">총 예약</div>
                <div class="stat-value">28건</div>
                <div class="stat-change">완료: 18 | 예정: 10</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-label">노쇼율</div>
                <div class="stat-value">2.5%</div>
                <div class="stat-change positive">-1.5% 지난주 대비</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-label">회원 수</div>
                <div class="stat-value">156명</div>
                <div class="stat-change positive">+8 이번 달</div>
            </div>
            
            <div class="card">
                <h3>호스피아 동기화</h3>
                <p>마지막 동기화: 5분 전</p>
                <button class="btn btn-primary mt-3">지금 동기화</button>
            </div>
            
            <div class="card">
                <h3>긴급 알림</h3>
                <div class="alert-list">
                    <div class="alert-item warning">
                        <span>⚠️ 루비(말) - 건강 체크 필요</span>
                    </div>
                    <div class="alert-item info">
                        <span>ℹ️ 긴급 슬롯 1건 발생 (14:00)</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ========================================
// 13. 알림 시스템
// ========================================

function showNotification(type, title, message, duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-title">${title}</div>
        <div class="notification-message">${message}</div>
    `;
    
    document.body.appendChild(notification);
    
    // 자동 제거
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

function playNotificationSound() {
    // 실제 환경에서는 오디오 파일 재생
    console.log('🔔 알림음 재생');
}

// ========================================
// 14. 로더 표시/숨김
// ========================================

function showLoader() {
    const loader = document.createElement('div');
    loader.id = 'globalLoader';
    loader.className = 'loader';
    loader.style.position = 'fixed';
    loader.style.top = '50%';
    loader.style.left = '50%';
    loader.style.transform = 'translate(-50%, -50%)';
    loader.style.zIndex = '10000';
    
    document.body.appendChild(loader);
}

function hideLoader() {
    const loader = document.getElementById('globalLoader');
    if (loader) {
        loader.remove();
    }
}

// ========================================
// 15. 날씨 정보
// ========================================

async function loadWeatherInfo() {
    const weatherWidget = document.getElementById('weatherWidget');
    if (!weatherWidget) return;
    
    // 실제로는 날씨 API 호출
    const weatherData = {
        temp: 7,
        condition: '대체로 흐림',
        high: 8,
        low: -1,
        suitable: true
    };
    
    weatherWidget.innerHTML = `
        <div class="widget">
            <div class="widget-title">날씨 정보</div>
            <div class="widget-value">${weatherData.temp}°</div>
            <div class="widget-subtitle">${weatherData.condition}</div>
            <div class="widget-subtitle">최고:${weatherData.high}° 최저:${weatherData.low}°</div>
            <div class="mt-3">
                ${weatherData.suitable 
                    ? '✅ 승마하기 좋은 날씨입니다' 
                    : '⚠️ 날씨 주의가 필요합니다'}
            </div>
        </div>
    `;
}

// ========================================
// 16. 현재 시간 업데이트
// ========================================

function updateCurrentTime() {
    const timeDisplay = document.getElementById('currentTime');
    if (!timeDisplay) return;
    
    const now = new Date();
    const timeString = now.toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        weekday: 'long'
    });
    
    timeDisplay.textContent = timeString;
}

// ========================================
// 17. 네비게이션 처리
// ========================================

function handleNavigation(e) {
    e.preventDefault();
    const target = e.currentTarget.getAttribute('href');
    
    if (target.startsWith('#')) {
        // 페이지 내 스크롤
        const element = document.querySelector(target);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    } else {
        // 페이지 이동
        window.location.href = target;
    }
    
    // 모바일 메뉴 닫기
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) {
        navMenu.classList.remove('active');
    }
}

// ========================================
// 18. 사용자 데이터 로드
// ========================================

async function loadUserData() {
    // 로컬 스토리지 또는 API에서 사용자 데이터 로드
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedUser) {
        AppState.currentUser = JSON.parse(savedUser);
        console.log('👤 사용자 로드:', AppState.currentUser);
    }
}

// ========================================
// 19. 차트 초기화 (선택사항)
// ========================================

function initializeCharts() {
    // Chart.js 또는 다른 차트 라이브러리 사용
    console.log('📊 차트 초기화');
}

// ========================================
// 20. 유틸리티 함수
// ========================================

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short'
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: 'KRW'
    }).format(amount);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ========================================
// 21. Export (모듈 사용 시)
// ========================================

// export { AppState, showNotification, handleBookingSubmit };

console.log('✅ 골드런 승마랜드 JavaScript 로드 완료');
