# 📱 Flymedia Academy LMS - Mobile App (Android & iOS)

A cross-platform native mobile application for **Flymedia Technology / Flymedia Academy LMS**, built with **React Native CLI** (pure React Native, no Expo) and **TypeScript**.

The mobile app matches the design, typography, brand colors, and functionalities of the web application.

---

## 🎨 Brand Design & Color Palette

The styling matches the web app's design system:
- **Primary Brand Orange**: `#ff9900`
- **Secondary Dark Brown**: `#723700`
- **Dark Surface / Hero Background**: `#0f172a` (Slate 900) & `#020617` (Slate 950)
- **App Canvas**: `#fafafa`
- **Cards & Surfaces**: Clean white `#ffffff` with subtle border `#e2e8f0` and shadows
- **Success / Badges**: `#10b981` (Emerald)

---

## 🚀 Features & Screens

1. **🏠 Home Screen**:
   - High-impact Hero Banner: *"We Don't Just Educate, We Give Opportunities"*
   - Why Learn With Us pillars: 100% Practical, Live Projects, Flexible Batches, Placement Drives
   - Quick Category filtering pills
   - Featured Career Programs with ratings, fees, duration, and skills
   - Interactive ₹99 one demo class booking banner
   - Student Success Stories & Testimonials (5-star ratings, placements)
   - Expandable FAQ accordion

2. **📚 Courses & Tracks**:
   - Real-time search by keyword, technology, or topic
   - Category filters (Web Dev, Digital Marketing, Graphic Design, AI/Python)
   - Detailed course cards with curriculum stage previews

3. **📖 Course Detail Screen**:
   - Comprehensive course header, ratings, and price
   - Stage-by-stage Curriculum & Syllabus breakdown
   - Skills & Tools learned badges (React, Node, MongoDB, SEO, Figma, Python)
   - One-tap "₹99 Demo Class" & "Enroll Now" actions

4. **🎓 My Learning (Student Portal)**:
   - Active course cards with real-time completion progress bar
   - Upcoming Live Class alert with **"Join Live Class"** button
   - Syllabus checklist
   - Course Completion Certificate status

5. **👤 Student Profile & Auth**:
   - User profile with role badge (STUDENT / TUTOR / ADMIN)
   - Authentication system (Sign In / Register / Logout) persisted via AsyncStorage
   - Flymedia Academy campus helpline phone, WhatsApp, and admissions email

---

## 🛠️ How to Run

### Prerequisites
- Node.js (v18+)
- Java JDK 17+ (for Android)
- Android Studio with Android SDK & Emulator
- Xcode & CocoaPods (for iOS on macOS)

### 🤖 Running on Android
```bash
# 1. Start Metro bundler
cd MobileApp
npm start

# 2. Launch Android emulator and build app
npm run android
# or
npx react-native run-android
```

### 🍏 Running on iOS
```bash
cd MobileApp/ios
pod install
cd ..

# Run iOS simulator
npm run ios
# or
npx react-native run-ios
```

---

## 📂 Project Structure

```
MobileApp/
├── App.tsx                        # Main Root with Providers & Navigation
├── android/                       # Native Android Project (Gradle / Java)
├── ios/                           # Native iOS Project (Xcode workspace / Pods)
└── src/
    ├── components/
    │   └── common/
    │       ├── Header.tsx         # Brand header with quick helpline
    │       ├── CourseCard.tsx     # Reusable course card component
    │       └── CallbackModal.tsx  # ₹99 Demo class booking modal
    ├── context/
    │   └── AuthContext.tsx        # Session state, login, and enrollments
    ├── data/
    │   └── mockData.ts            # Production LMS course data
    ├── navigation/
    │   └── AppNavigator.tsx       # Bottom Tabs & Native Stack
    ├── screens/
    │   ├── HomeScreen.tsx
    │   ├── CoursesScreen.tsx
    │   ├── CourseDetailScreen.tsx
    │   ├── MyLearningScreen.tsx
    │   └── ProfileScreen.tsx
    ├── theme/
    │   └── colors.ts              # Exact web color tokens
    └── types/
        └── index.ts               # TypeScript interfaces
```
