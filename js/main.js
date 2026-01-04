/* ============================================
   골드런 승마랜드 - 메인 JavaScript
   예약 시스템, 알림, 대시보드 기능
   ============================================ */

// ============================================
// 1. Global State Management
// ============================================
const AppState = {
  user: null,
  bookings: [],
  urgentSlots: [],
  horses: [],
  coaches: [],
  currentRole: 'member', // member, student, coach, admin
  notifications: [],
};

// ============================================
// 2. Utility Functions
// ============================================
const Utils = {
  // Format date to Korean style
  formatDate: (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
  },

  // Format time to 24h
  formatTime: (time) => {
    return time.padStart(5, '0');
  },

  // Show notification
  showNotification: (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.innerHTML = `
      <span>${getIcon(type)}</span>
      <span>${message}</span>
    `;
    
    const container = document.querySelector('.notification-container') || createNotificationContainer();
    container.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideDown 0.3s ease-out reverse';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  },

  // Validate phone number
  validatePhone: (phone) => {
    const regex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
    return regex.test(phone);
  },

  // Validate email
  validateEmail: (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  // Calculate days until date
  daysUntil: (date) => {
    const today = new Date();
    const target = new Date(date);
    const diff = target - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  },

  // Generate random ID
  generateId: () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },
};

// ============================================
// 3. Icon Helper
// ============================================
function getIcon(type) {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };
  return icons[type] || icons.info;
}

function createNotificationContainer() {
  const container = document.createElement('div');
  container.className = 'notification-container';
  container.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 400px;
  `;
  document.body.appendChild(container);
  return container;
}

// ============================================
// 4. Booking System
// ============================================
const BookingSystem = {
  // Initialize booking form
  init: () => {
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
      bookingForm.addEventListener('submit', BookingSystem.handleSubmit);
    }

    // Load available time slots
    BookingSystem.loadTimeSlots();
    
    // Load horses and coaches
    BookingSystem.loadHorses();
    BookingSystem.loadCoaches();
  },

  // Load available time slots
  loadTimeSlots: () => {
    const timeSlotsContainer = document.getElementById('time-slots');
    if (!timeSlotsContainer) return;

    const timeSlots = [
      '09:00', '10:00', '11:00', '12:00',
      '13:00', '14:00', '15:00', '16:00', '17:00'
    ];

    timeSlotsContainer.innerHTML = timeSlots.map(time => `
      <div class="time-slot" data-time="${time}">
        <div>${time}</div>
        <small>예약 가능</small>
      </div>
    `).join('');

    // Add click event listeners
    document.querySelectorAll('.time-slot').forEach(slot => {
      slot.addEventListener('click', () => {
        if (slot.classList.contains('disabled')) return;
        
        // Remove previous selection
        document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
        
        // Select current slot
        slot.classList.add('selected');
        
        // Store selected time
        const selectedTime = slot.dataset.time;
        document.getElementById('selected-time').value = selectedTime;
      });
    });
  },

  // Load horses
  loadHorses: () => {
    const horseSelect = document.getElementById('horse-select');
    if (!horseSelect) return;

    const horses = [
      { id: 1, name: '바람이', suitable: true },
      { id: 2, name: '별이', suitable: true },
      { id: 3, name: '구름이', suitable: false },
      { id: 4, name: '햇살이', suitable: true },
    ];

    AppState.horses = horses;

    horseSelect.innerHTML = '<option value="">자동 배정</option>' + horses.map(horse => `
      <option value="${horse.id}">
        ${horse.name} ${horse.suitable ? '(초보자 적합)' : '(중급 이상)'}
      </option>
    `).join('');
  },

  // Load coaches
  loadCoaches: () => {
    const coachSelect = document.getElementById('coach-select');
    if (!coachSelect) return;

    const coaches = [
      { id: 1, name: '김코치' },
      { id: 2, name: '이코치' },
      { id: 3, name: '박코치' },
    ];

    AppState.coaches = coaches;

    coachSelect.innerHTML = '<option value="">자동 배정</option>' + coaches.map(coach => `
      <option value="${coach.id}">${coach.name}</option>
    `).join('');
  },

  // Handle booking form submission
  handleSubmit: async (e) => {
    e.preventDefault();

    const formData = {
      date: document.getElementById('booking-date').value,
      time: document.getElementById('selected-time').value,
      name: document.getElementById('booking-name').value,
      phone: document.getElementById('booking-phone').value,
      horse: document.getElementById('horse-select').value,
      coach: document.getElementById('coach-select').value,
      type: document.getElementById('booking-type').value,
      notes: document.getElementById('booking-notes').value,
    };

    // Validation
    if (!formData.date || !formData.time) {
      Utils.showNotification('날짜와 시간을 선택해주세요.', 'warning');
      return;
    }

    if (!formData.name || !formData.phone) {
      Utils.showNotification('이름과 전화번호를 입력해주세요.', 'warning');
      return;
    }

    if (!Utils.validatePhone(formData.phone)) {
      Utils.showNotification('올바른 전화번호를 입력해주세요. (예: 010-1234-5678)', 'error');
      return;
    }

    // Create booking
    const booking = {
      id: Utils.generateId(),
      ...formData,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    AppState.bookings.push(booking);

    // Show success message
    Utils.showNotification('예약이 완료되었습니다! SMS가 발송됩니다.', 'success');

    // Simulate SMS sending
    setTimeout(() => {
      BookingSystem.sendConfirmationSMS(booking);
    }, 500);

    // Reset form
    e.target.reset();
    document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));

    // Show booking summary
    BookingSystem.showBookingSummary(booking);
  },

  // Send confirmation SMS
  sendConfirmationSMS: (booking) => {
    const message = `
[골드런 승마랜드] 예약 완료
날짜: ${Utils.formatDate(booking.date)}
시간: ${booking.time}
이름: ${booking.name}

예약 24시간 전과 2시간 전에 알림을 보내드립니다.
취소는 24시간 전까지 가능합니다.

문의: 010-9102-1600
    `;

    console.log('SMS 발송:', message);
    Utils.showNotification('예약 확인 SMS가 발송되었습니다.', 'info');
  },

  // Show booking summary
  showBookingSummary: (booking) => {
    const modal = document.createElement('div');
    modal.className = 'booking-modal';
    modal.innerHTML = `
      <div class="card" style="max-width: 500px; margin: 100px auto; position: relative; z-index: 10000;">
        <h3>🎉 예약 완료!</h3>
        <div style="margin: 20px 0;">
          <p><strong>예약번호:</strong> ${booking.id.substr(0, 8)}</p>
          <p><strong>날짜:</strong> ${Utils.formatDate(booking.date)}</p>
          <p><strong>시간:</strong> ${booking.time}</p>
          <p><strong>이름:</strong> ${booking.name}</p>
          <p><strong>전화번호:</strong> ${booking.phone}</p>
          <p><strong>유형:</strong> ${booking.type === 'experience' ? '체험승마' : '회원승마'}</p>
        </div>
        <div class="alert alert-info">
          <span>ℹ️</span>
          <span>예약 확인 SMS가 발송되었습니다.</span>
        </div>
        <button class="btn btn-primary" onclick="this.closest('.booking-modal').remove()">확인</button>
      </div>
      <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 9999;" onclick="this.parentElement.remove()"></div>
    `;
    document.body.appendChild(modal);
  },
};

// ============================================
// 5. Urgent Slot System (긴급 슬롯)
// ============================================
const UrgentSlotSystem = {
  // Initialize urgent slot monitoring
  init: () => {
    // Simulate checking for urgent slots every 30 seconds
    setInterval(UrgentSlotSystem.checkUrgentSlots, 30000);
  },

  // Check for urgent slots
  checkUrgentSlots: async () => {
    // In production, this would fetch from API
    // Simulating random urgent slot availability
    if (Math.random() < 0.1) { // 10% chance
      const urgentSlot = {
        id: Utils.generateId(),
        date: new Date().toISOString().split('T')[0],
        time: '14:00',
        reason: '학교승마 취소',
        createdAt: new Date().toISOString(),
      };

      AppState.urgentSlots.push(urgentSlot);
      UrgentSlotSystem.notifyWaitlist(urgentSlot);
    }
  },

  // Notify waitlist
  notifyWaitlist: (slot) => {
    Utils.showNotification(
      `🚨 긴급 슬롯 발생! ${Utils.formatDate(slot.date)} ${slot.time} - 지금 예약하세요!`,
      'warning'
    );

    // Show urgent slot card
    UrgentSlotSystem.showUrgentSlotCard(slot);
  },

  // Show urgent slot card
  showUrgentSlotCard: (slot) => {
    const container = document.getElementById('urgent-slots-container');
    if (!container) return;

    const card = document.createElement('div');
    card.className = 'card card-primary animate-pulse';
    card.innerHTML = `
      <div class="card-icon">🚨</div>
      <h3 class="card-title">긴급 슬롯!</h3>
      <p class="card-description">
        <strong>${Utils.formatDate(slot.date)} ${slot.time}</strong><br>
        ${slot.reason}<br>
        <small>선착순 마감됩니다!</small>
      </p>
      <button class="btn btn-secondary" onclick="BookingSystem.bookUrgentSlot('${slot.id}')">
        지금 예약하기
      </button>
    `;

    container.appendChild(card);

    // Auto-remove after 5 minutes
    setTimeout(() => card.remove(), 300000);
  },

  // Book urgent slot
  bookUrgentSlot: (slotId) => {
    const slot = AppState.urgentSlots.find(s => s.id === slotId);
    if (!slot) {
      Utils.showNotification('이미 마감된 슬롯입니다.', 'error');
      return;
    }

    // Pre-fill booking form
    document.getElementById('booking-date').value = slot.date;
    document.getElementById('selected-time').value = slot.time;

    // Scroll to booking form
    document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });

    Utils.showNotification('예약 정보를 입력해주세요.', 'info');
  },
};

// ============================================
// 6. Dashboard System
// ============================================
const Dashboard = {
  // Initialize dashboard
  init: () => {
    const roleButtons = document.querySelectorAll('.role-btn');
    roleButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const role = btn.dataset.role;
        Dashboard.switchRole(role);
      });
    });

    // Load initial dashboard
    Dashboard.switchRole(AppState.currentRole);
  },

  // Switch role
  switchRole: (role) => {
    AppState.currentRole = role;

    // Update active button
    document.querySelectorAll('.role-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.role === role);
    });

    // Hide all dashboards
    document.querySelectorAll('.dashboard-content').forEach(content => {
      content.classList.add('hidden');
    });

    // Show selected dashboard
    const selectedDashboard = document.getElementById(`${role}-dashboard`);
    if (selectedDashboard) {
      selectedDashboard.classList.remove('hidden');
      Dashboard.loadDashboardData(role);
    }
  },

  // Load dashboard data
  loadDashboardData: (role) => {
    switch (role) {
      case 'member':
        Dashboard.loadMemberDashboard();
        break;
      case 'student':
        Dashboard.loadStudentDashboard();
        break;
      case 'coach':
        Dashboard.loadCoachDashboard();
        break;
      case 'admin':
        Dashboard.loadAdminDashboard();
        break;
    }
  },

  // Load member dashboard
  loadMemberDashboard: () => {
    const stats = {
      totalBookings: AppState.bookings.length,
      completedLessons: Math.floor(AppState.bookings.length * 0.8),
      attendanceRate: 85,
      upcomingLessons: 3,
    };

    Dashboard.updateStats('member-stats', [
      { label: '전체 예약', value: stats.totalBookings },
      { label: '완료한 레슨', value: stats.completedLessons },
      { label: '출석률', value: `${stats.attendanceRate}%` },
      { label: '예정된 레슨', value: stats.upcomingLessons },
    ]);

    // Generate QR code
    Dashboard.generateQRCode('member-qr');

    // Load booking history
    Dashboard.loadBookingHistory();
  },

  // Load student dashboard
  loadStudentDashboard: () => {
    const stats = {
      totalSessions: 10,
      completedSessions: 7,
      attendanceRate: 70,
      nextLesson: '2026-01-10',
    };

    Dashboard.updateStats('student-stats', [
      { label: '전체 수업', value: stats.totalSessions },
      { label: '완료', value: stats.completedSessions },
      { label: '출석률', value: `${stats.attendanceRate}%` },
      { label: '남은 수업', value: stats.totalSessions - stats.completedSessions },
    ]);

    // Update progress bar
    const progressBar = document.getElementById('student-progress');
    if (progressBar) {
      const percentage = (stats.completedSessions / stats.totalSessions) * 100;
      progressBar.querySelector('.progress-fill').style.width = `${percentage}%`;
      progressBar.querySelector('.progress-text').textContent = 
        `${stats.completedSessions}/${stats.totalSessions} 완료 (${percentage}%)`;
    }

    // Update Horsepia sync status
    Dashboard.updateHorsepiaStatus();
  },

  // Load coach dashboard
  loadCoachDashboard: () => {
    const stats = {
      todayLessons: 8,
      completedToday: 5,
      totalStudents: 24,
      averageRating: 4.8,
    };

    Dashboard.updateStats('coach-stats', [
      { label: '오늘 수업', value: stats.todayLessons },
      { label: '완료', value: stats.completedToday },
      { label: '전체 학생', value: stats.totalStudents },
      { label: '평균 평점', value: `⭐ ${stats.averageRating}` },
    ]);

    // Load today's schedule
    Dashboard.loadTodaySchedule();
  },

  // Load admin dashboard
  loadAdminDashboard: () => {
    const stats = {
      todayRevenue: 1250000,
      todayBookings: 32,
      noShowRate: 3.2,
      horsepiaSync: 'OK',
    };

    Dashboard.updateStats('admin-stats', [
      { label: '오늘 매출', value: `${stats.todayRevenue.toLocaleString()}원` },
      { label: '오늘 예약', value: stats.todayBookings },
      { label: '노쇼율', value: `${stats.noShowRate}%` },
      { label: '호스피아', value: stats.horsepiaSync },
    ]);

    // Load charts and analytics
    Dashboard.loadAnalytics();
  },

  // Update stats
  updateStats: (containerId, stats) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = stats.map(stat => `
      <div class="stat-card">
        <div class="stat-value">${stat.value}</div>
        <div class="stat-label">${stat.label}</div>
      </div>
    `).join('');
  },

  // Generate QR code
  generateQRCode: (containerId) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="qr-container">
        <div class="qr-code">📱</div>
        <p><strong>출석 체크용 QR 코드</strong></p>
        <small>코치에게 스캔해주세요</small>
      </div>
    `;
  },

  // Load booking history
  loadBookingHistory: () => {
    const container = document.getElementById('booking-history');
    if (!container) return;

    if (AppState.bookings.length === 0) {
      container.innerHTML = '<p class="text-center" style="color: #9CA3AF;">예약 내역이 없습니다.</p>';
      return;
    }

    container.innerHTML = AppState.bookings.map(booking => `
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <h4>${Utils.formatDate(booking.date)} ${booking.time}</h4>
            <p style="color: #6B7280; font-size: 0.9rem; margin: 8px 0;">
              ${booking.type === 'experience' ? '체험승마' : '회원승마'}
            </p>
          </div>
          <span class="badge badge-${booking.status === 'confirmed' ? 'success' : 'gray'}">
            ${booking.status === 'confirmed' ? '예약완료' : booking.status}
          </span>
        </div>
      </div>
    `).join('');
  },

  // Update Horsepia status
  updateHorsepiaStatus: () => {
    const container = document.getElementById('horsepia-status');
    if (!container) return;

    container.innerHTML = `
      <div class="card">
        <h4>🔗 호스피아 연동 상태</h4>
        <div style="margin: 16px 0;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>동기화 상태:</span>
            <span class="badge badge-success">정상</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>마지막 동기화:</span>
            <span>2026-01-04 07:30</span>
          </div>
        </div>
        <button class="btn btn-secondary" style="width: 100%; margin-top: 12px;">
          지금 동기화
        </button>
      </div>
    `;
  },

  // Load today's schedule
  loadTodaySchedule: () => {
    const container = document.getElementById('today-schedule');
    if (!container) return;

    const schedule = [
      { time: '09:00', student: '김민지', horse: '바람이', status: 'completed' },
      { time: '10:00', student: '이서준', horse: '별이', status: 'completed' },
      { time: '11:00', student: '박지우', horse: '햇살이', status: 'completed' },
      { time: '13:00', student: '최예나', horse: '구름이', status: 'in-progress' },
      { time: '14:00', student: '정하윤', horse: '바람이', status: 'upcoming' },
      { time: '15:00', student: '강도현', horse: '별이', status: 'upcoming' },
    ];

    container.innerHTML = schedule.map(lesson => `
      <div class="card" style="padding: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="font-size: 1.1rem;">${lesson.time}</strong>
            <p style="margin: 4px 0; color: #6B7280;">
              ${lesson.student} - ${lesson.horse}
            </p>
          </div>
          <span class="badge badge-${
            lesson.status === 'completed' ? 'success' :
            lesson.status === 'in-progress' ? 'warning' : 'info'
          }">
            ${
              lesson.status === 'completed' ? '완료' :
              lesson.status === 'in-progress' ? '진행중' : '예정'
            }
          </span>
        </div>
      </div>
    `).join('');
  },

  // Load analytics
  loadAnalytics: () => {
    const container = document.getElementById('analytics-container');
    if (!container) return;

    container.innerHTML = `
      <div class="card">
        <h4>📊 이번 주 통계</h4>
        <div style="margin-top: 16px;">
          <div style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>월요일</span>
              <strong>28건</strong>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 70%;"></div>
            </div>
          </div>
          <div style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>화요일</span>
              <strong>32건</strong>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 80%;"></div>
            </div>
          </div>
          <div style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>수요일</span>
              <strong>35건</strong>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 87%;"></div>
            </div>
          </div>
          <div style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>목요일</span>
              <strong>30건</strong>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 75%;"></div>
            </div>
          </div>
          <div style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>금요일</span>
              <strong>38건</strong>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 95%;"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  },
};

// ============================================
// 7. Mobile Menu Toggle
// ============================================
function initMobileMenu() {
  const navbarToggle = document.querySelector('.navbar-toggle');
  const navbarMenu = document.querySelector('.navbar-menu');

  if (navbarToggle && navbarMenu) {
    navbarToggle.addEventListener('click', () => {
      navbarMenu.classList.toggle('active');
    });
  }
}

// ============================================
// 8. Smooth Scroll
// ============================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// ============================================
// 9. Scroll Animations
// ============================================
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeInUp 0.8s ease-out';
        entry.target.style.opacity = '1';
      }
    });
  }, observerOptions);

  document.querySelectorAll('.card, .feature-card, .education-card').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
  });
}

// ============================================
// 10. Initialize App
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('🐴 골드런 승마랜드 시스템 초기화...');

  // Initialize all systems
  BookingSystem.init();
  UrgentSlotSystem.init();
  
  // Check if we're on dashboard page
  if (document.getElementById('dashboard-container')) {
    Dashboard.init();
  }

  // Initialize UI features
  initMobileMenu();
  initSmoothScroll();
  initScrollAnimations();

  console.log('✅ 초기화 완료!');
});

// ============================================
// 11. Export for global access
// ============================================
window.BookingSystem = BookingSystem;
window.UrgentSlotSystem = UrgentSlotSystem;
window.Dashboard = Dashboard;
window.Utils = Utils;
