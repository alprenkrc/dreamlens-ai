# DreamLens AI 🌙✨

DreamLens AI is a revolutionary mobile application that empowers you to explore your dreams through artificial intelligence. Transform your nocturnal journeys into mesmerizing visual artworks and gain deep insights into your subconscious mind.

## 🇹🇷 Amaç

Kullanıcıların rüyalarını kolayca kaydetmesini (ses veya metin), yapay zekâ ile görselleştirmesini ve zaman içinde rüya alışkanlıklarına dair kişisel içgörüler elde etmesini sağlamak. Uygulama, rüyaları güvenle saklar; dönemsel analizlerle (ör. son 1 ayda kabus oranı, tekrar eden temalar, duygu dağılımı) iyi oluş ve stres düzeyi hakkında veri odaklı ipuçları sunar.

## 🇹🇷 Değer Önerisi

- **Rüya Kaydı**: Hızlı ses/metin girişi, otomatik özetleme ve etiketleme.
- **AI Görselleştirme**: Rüyaları FAL modelleri ile sanatsal görsellere dönüştürme.
- **Kişisel Analitik**: Zaman serisi metrikleri (kabus oranı, tema sıklığı, duygu analizi).
- **Güvenli Saklama**: Özel rüya günlüğü ve güvenli veri yönetimi.
- **Eyleme Dönük İçgörüler**: Örn. “Bu ay kabus oranı arttı; stresli bir dönem olabilir.”

## 🇹🇷 İlham / Bağlam

Bu proje, `tasarlacanak ekranlar/neden bu uygulamayı geliştiriyorum.md` içeriğindeki hackathon kapsamından ilham alarak, paywall tasarımı, onboarding akışı ve AI entegrasyonuna odaklı bir deneyim olarak şekillendirilmiştir.

## 🎯 Features

### Core Functionality
- **🎤 Voice & Text Recording**: Multiple input methods for dream capture
- **🎨 AI Visual Generation**: FAL-powered surreal dream artwork creation  
- **🔮 Symbolic Analysis**: Deep psychological and symbolic interpretation
- **📊 Dream Pattern Tracking**: Personal analytics and trend insights
- **🌙 Lucid Dream Guidance**: Techniques for conscious dreaming
- **💎 Premium AI Counselor**: Personalized dream interpretation and advice

### Technical Excellence
- **🚀 FAL API Integration**: State-of-the-art generative AI models (to be integrated)
- **💳 RevenueCat Monetization**: Seamless subscription management (to be integrated) 
- **📱 Cross-Platform**: React Native for iOS and Android
- **🔒 Secure Storage**: Private dream journal with encryption
- **🎯 Smart Onboarding**: Intuitive user experience design

## 🏗️ Architecture

### Navigation Structure
- **Tab-based Layout**: Primary navigation with 5 core sections
- **Home**: Dashboard with stats and quick actions
- **Record**: Voice and text dream recording interface
- **Gallery**: AI-generated visual dream interpretations
- **Analysis**: Comprehensive dream pattern analytics
- **Profile**: User settings and achievement system

### Design Philosophy
- **Mystical Aesthetics**: Deep purples, ethereal blues, cosmic gradients
- **Glassmorphism Effects**: Subtle blur and transparency elements
- **Smooth Animations**: Micro-interactions and fluid transitions
- **Celestial Theme**: Stars, moons, and constellation motifs

## 🛠️ Technology Stack

- **Framework**: Expo (React Native)
- **UI Components**: Custom components with Expo modules
- **Animations**: React Native Reanimated
- **Icons**: Lucide React Native
- **Styling**: StyleSheet with responsive design
- **Background Effects**: Expo Linear Gradient & Blur View

## 💰 Monetization Tiers

### Free Tier
- 1 daily dream recording
- Basic AI analysis
- Standard visualizations
- Limited dream history

### Premium ($4.99/month)
- Unlimited dream recordings
- Advanced AI interpretations
- HD visualizations
- Dream pattern analytics
- Lucid dreaming guides

### Premium Plus ($9.99/month)
- Personal AI counselor
- Detailed psychological insights
- Community features
- Export capabilities
- Priority support

## 🔧 Setup & Integration

### Required Integrations

1. **FAL API Integration** (Not yet implemented)
   - Add FAL API credentials to environment variables
   - Implement image generation endpoints
   - Handle API responses and error states

2. **RevenueCat Setup** (Not yet implemented)
   - Configure subscription products
   - Implement paywall screens
   - Handle subscription states and restoration

3. **Voice Recording** (Foundation ready)
   - Expo AV integration for audio recording
   - Speech-to-text processing
   - Audio file management

### Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build:web
```

### Environment Variables

Create a `.env` file with:
```
EXPO_PUBLIC_FAL_API_KEY=your_fal_api_key
EXPO_PUBLIC_REVENUECAT_API_KEY=your_revenuecat_key
```

## 📱 Key Screens

1. **Home Dashboard**: Dream stats, quick record, recent dreams
2. **Record Interface**: Voice/text input with vividness rating
3. **Gallery Grid**: AI-generated dream visualizations
4. **Analytics Dashboard**: Pattern analysis and insights
5. **Profile Management**: Settings, achievements, subscriptions

## 🎨 Design System

### Color Palette
- Primary: `#6B46C1` (Purple)
- Secondary: `#A78BFA` (Light Purple)
- Accent: `#FBBF24` (Gold)
- Background: Gradient from `#0F0A2E` to `#6B46C1`

### Typography
- Headings: Bold, white color
- Body: Regular weight, light purple/gray
- Interactive: Medium weight with color transitions

### Components
- Blur views for depth
- Gradient backgrounds
- Rounded corners (15-20px radius)
- Subtle shadows and elevation

## 🚀 Next Steps

1. **Integrate FAL API** for dream visualization generation
2. **Implement RevenueCat** for subscription management
3. **Add voice recording** functionality with speech processing
4. **Create onboarding flow** for new users
5. **Implement data persistence** with secure local storage
6. **Add push notifications** for dream reminders
7. **Build community features** for dream sharing

## 📄 License

This project is created for demonstration purposes. Please ensure proper licensing for production use.

---

*Transform your dreams into art with DreamLens AI* ✨