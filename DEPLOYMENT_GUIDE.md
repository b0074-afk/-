# 🚀 Netlify 배포 가이드

## 📦 파일 다운로드

### 방법 1: ZIP 파일 사용 (권장)
1. `goldrun-horseriding.zip` 파일 다운로드
2. 압축 해제
3. Netlify에 드래그 앤 드롭

### 방법 2: GitHub 연동
GitHub에서 코드를 가져와서 Netlify에 자동 배포

---

## 🌐 Netlify 배포 방법

### A. 드래그 앤 드롭 배포 (가장 쉬움!)

1. **Netlify 사이트 접속**
   - https://app.netlify.com/drop

2. **파일 준비**
   - `goldrun-horseriding.zip` 압축 해제
   - 또는 프로젝트 폴더 전체 선택

3. **드래그 앤 드롭**
   - 폴더를 Netlify Drop 페이지로 드래그
   - 자동으로 배포 시작!

4. **완료!**
   - 5초 후 배포 완료
   - 무료 도메인 자동 생성 (예: `goldrun-horseriding.netlify.app`)

---

### B. GitHub 연동 배포 (자동 업데이트)

1. **Netlify 로그인**
   - https://app.netlify.com

2. **New Site from Git 클릭**

3. **GitHub 연결**
   - GitHub 계정 연결
   - 저장소 선택: `b0074-afk/-`

4. **빌드 설정**
   ```
   Branch to deploy: main
   Build command: (비워둠)
   Publish directory: .
   ```

5. **Deploy site 클릭**

6. **완료!**
   - 자동 배포 완료
   - Git push 시마다 자동 재배포

---

## ⚙️ 추천 Netlify 설정

### 1. 커스텀 도메인 설정
```
Domain settings → Add custom domain
예: goldrun.co.kr
```

### 2. HTTPS 활성화
```
자동으로 Let's Encrypt SSL 인증서 발급
```

### 3. 폼 알림 설정 (예약 시스템 연동 시)
```
Settings → Forms → Form notifications
```

### 4. 환경 변수 설정 (API 연동 시)
```
Site settings → Environment variables
HORSEPIA_API_KEY=your_key
SMS_API_KEY=your_key
```

---

## 📂 배포할 파일 구조

```
goldrun-horseriding/
├── index.html          # 메인 페이지 ✅
├── dashboard.html      # 대시보드 ✅
├── README.md          # 프로젝트 문서 ✅
├── css/
│   └── style.css      # 스타일시트 ✅
├── js/
│   └── main.js        # JavaScript ✅
└── images/            # 이미지 폴더 (비어있음)
```

**총 파일 크기**: 약 29KB (압축)

---

## ✅ 배포 체크리스트

### 배포 전
- [x] 모든 파일 확인
- [x] index.html이 루트에 있는지 확인
- [x] 상대 경로 확인 (css/, js/)
- [x] 이미지 경로 확인

### 배포 후
- [ ] 메인 페이지 접속 테스트
- [ ] 대시보드 접속 테스트
- [ ] 모바일 반응형 테스트
- [ ] 예약 폼 작동 테스트
- [ ] 네비게이션 링크 테스트

---

## 🔧 문제 해결

### Q1: 페이지가 제대로 안 보여요
**A**: `index.html`이 루트 디렉토리에 있는지 확인

### Q2: CSS/JS가 안 적용돼요
**A**: 경로 확인
```html
<!-- 올바른 경로 -->
<link rel="stylesheet" href="css/style.css">
<script src="js/main.js"></script>
```

### Q3: 404 에러가 나요
**A**: Netlify 설정에서 리다이렉트 추가
```
/* /index.html 200
```

### Q4: 폼 제출이 안 돼요
**A**: 현재 프론트엔드만 구현되어 있습니다.
백엔드 API 연동 필요 (Phase 2)

---

## 🎯 추가 최적화

### 1. 성능 최적화
- Netlify의 자동 압축 활용
- 이미지 최적화 (WebP 변환)
- CDN 자동 활성화

### 2. SEO 최적화
- `sitemap.xml` 생성
- `robots.txt` 생성
- Open Graph 메타 태그 추가

### 3. 분석 도구 연동
- Google Analytics
- Netlify Analytics
- Hotjar (사용자 행동 분석)

---

## 📞 지원

배포 중 문제가 생기면:
- Netlify 공식 문서: https://docs.netlify.com
- Netlify 커뮤니티: https://answers.netlify.com

---

**행운을 빕니다! 🍀**

배포 후 링크를 공유해주세요!
