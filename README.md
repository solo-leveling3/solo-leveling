# 🚀 TechNx — A Swipe-Based Mobile App For Tech/AI News

<div align="center">

<p align="center">
  <img src="https://res.cloudinary.com/dcpa501nb/image/upload/v1753582504/logo3-removebg-preview_q4ubul.png" alt="TechNx Logo" width="200"/>
</p>


**TechNx** is a modern, Swipe-based mobile app that delivers hourly **tech news updates** in a swipeable, personalized format. Built for **students, professionals, and creators** who want to stay updated and **upskill in a smarter way** — even in their native language.


</div>

---

## 🎯 Why TechNx?

<div align="center">

> 🧠 **Problem:** Overwhelmed by long tech articles and cluttered news feeds?  
> 📱 **TechNx** solves this by offering simple, AI-curated cards with summaries, takeaways, videos & translations — all in a swipe!

</div>

### 💡 The Vision

Transform how people consume tech news by making it **accessible**, **digestible**, and **actionable** for everyone, regardless of their technical background or language preference.

---

## 👥 Target Audience

<table>
<tr>
<td align="center" width="25%">
<b>Students</b><br/>
<i>Learning & staying updated</i>
</td>
<td align="center" width="25%">
<b>Professionals</b><br/>
<i>Upskilling & career growth</i>
</td>
<td align="center" width="25%">
<b>Non-English Users</b><br/>
<i>Regional language support</i>
</td>
<td align="center" width="25%">
<b>Tech Enthusiasts</b><br/>
<i>Simplified tech updates</i>
</td>
</tr>
</table>

---

## ✨ Key Features

<div align="center">

### 🎨 **User Experience**
</div>

| 🎯 Feature | 📝 Description | 🚀 Benefit |
|------------|----------------|-------------|
| 🔁 **Swipeable Cards** | Easy vertical swipe navigation for reading tech news | Intuitive mobile-first experience |
| 🧠 **AI Summaries** | Smart, short summaries from Gemini/OpenAI models | Save time, get key insights |
| 📈 **Key Takeaways** | Clear "What You Learn" section for each article | Focused learning outcomes |
| 📺 **YouTube Integration** | Related YouTube videos with one-tap access | Multi-format learning |
| 🌐 **Multilingual Support** | Google Translate API for regional languages | Break language barriers |
| 💾 **Save to Bookmarks** | Offline reading & article saving support | Access anytime, anywhere |
| 🌓 **Theme Toggle** | Light and Dark mode switch | Comfortable reading experience |
| 🔁 **Pull-to-Refresh** | Swipe down for the latest hourly tech updates | Always fresh content |

---

## 🏗️ Tech Stack

<div align="center">

### 🔧 **Built with Modern Technologies**

</div>

<table>
<tr>
<td align="center" width="20%">
<b>Frontend</b>
</td>
<td width="80%">
<code>Expo</code> • <code>React Native</code> • <code>TypeScript</code> • <code>Gesture Handler</code>
</td>
</tr>
<tr>
<td align="center">
<b>Backend</b>
</td>
<td>
<code>Node.js</code> • <code>Express.js</code>
</td>
</tr>
<tr>
<td align="center">
<b>APIs & Tools</b>
</td>
<td>
<code>RSS Feed</code> • <code>Gemini API</code> • <code>YouTube API</code> • <code>Google Translate API</code> • <code>Unsplash API</code>
</td>
</tr>
<tr>
<td align="center">
<b>Database</b>
</td>
<td>
<code>Firebase Firestore</code> • <code>Firebase Storage</code>
</td>
</tr>
<tr>
<td align="center">
<b>UX/UI</b>
</td>
<td>
<code>Expo Router</code> • <code>Tailwind-like styling</code> • <code>Modern Cards</code> • <code>Tab Layout</code>
</td>
</tr>
<tr>
<td align="center">
<b>Dev Tools</b>
</td>
<td>
<code>GitHub</code> • <code>VS Code</code> • <code>Expo Go</code> • <code>ESLint</code>
</td>
</tr>
</table>

---

## 🚀 How to Run the App

### 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Expo CLI**
- **Git**

### 1. 📦 Clone the Repository

```bash
# Clone the repository
git clone URL

# Navigate to project directory
cd Your-App-Folder

# Install dependencies
npm install
# or
yarn install
```

### 2. 🔧 Install Expo CLI (if not already installed)

```bash
npm install -g @expo/cli
```

### 3. 🚀 Start the Development Server

```bash
# Start Expo development server
npx expo start
# or
yarn expo start
```

### 4. 📱 Run the App

After starting the server, you can run the app on:

```bash
# Android device/emulator
a

# iOS device/simulator  
i

# Web browser
w
```

**📱 Mobile Testing:**
1. Install **Expo Go** app on your device
2. Scan the QR code from terminal
3. App will load automatically

---

## ⚙️ Configuration Setup

### 🔥 Firebase Configuration

Create a `firebase.ts` file in your project root and add your Firebase configuration:

```typescript
// firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

### 🌍 Environment Variables

Create a `.env` file for your API keys in Backend:

```bash
# .env
GEMINI_API_KEY=your_gemini_api_key
YOUTUBE_API_KEY=your_youtube_api_key
GOOGLE_TRANSLATE_API_KEY=your_translate_api_key
UNSPLASH_ACCESS_KEY=your_unsplash_key
```

### 🌐 Language & Theme Setup

- 🗣️ **Language Selection:** Available in Profile tab
- 🌓 **Theme:** Auto-applies based on device preference
- 🔄 **Translation:** Powered by Google Translate API

---

## 📽️ Demo Video

<div align="center">

**▶️ [Watch TechNx Demo on YouTube](https://youtu.be/xqdXSA8hNI4?si=PzMMjLlc1HGHMjo1)**

*Click the above the link to see TechNx in action!*

</div>

---

## 🧠 AI-Powered Learning Experience

<div align="center">

### 📚 **Every Tech Card Includes:**

</div>

<table>
<tr>
<td align="center" width="33%">
<b>Why It Matters</b><br/>
<i>Real-world impact & relevance</i>
</td>
<td align="center" width="33%">
<b>What You Learn</b><br/>
<i>Upskilling takeaways & insights</i>
</td>
<td align="center" width="33%">
<b>AI Lesson Page</b><br/>
<i>Full, structured deep-dive</i>
</td>
</tr>
</table>

---

## 🛣️ Roadmap & Future Enhancements

<div align="left">

### 🎯 **Coming Soon**

</div>

| 🚀 Phase     | 🎯 Features                                                                 |
|--------------|------------------------------------------------------------------------------|
| **Phase 1**  | 🔒 User Authentication (Firebase Auth)<br/>🎯 Personalized Feed Algorithm    |
| **Phase 2**  | 🏆 Learning Goals & Progress Tracking     |
| **Phase 3**  | 🔔 Smart Push Notifications<br/>📱 Native iOS/Android Builds                  |
| **Phase 4**  | 🤖 AI Chatbot Assistant<br/>🌟 Premium Features & Subscriptions               |


---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### 🔧 Development Workflow

```bash
# Fork the repository
git fork https://github.com/yourusername/solo-leveling.git

# Create a feature branch  
git checkout -b feature/amazing-feature

# Make your changes and commit
git commit -m "Add amazing feature"

# Push to your branch
git push origin feature/amazing-feature

# Open a Pull Request
```

## ⭐ Show Your Support

If you found TechNx helpful, please consider:

- ⭐ **Starring** this repository
- 🍴 **Forking** to contribute
- 📢 **Sharing** with your network
- 💬 **Providing feedback** via issues

<div align="center">

### 🚀 **Made with ❤️ by the TechNx Team**

**Empowering the next generation of tech learners, one swipe at a time.**

---

*© 2024 TechNx. Built with passion for the global tech community.*

[![Built with React Native](https://img.shields.io/badge/Built%20with-React%20Native-blue.svg)](https://reactnative.dev/)
[![Powered by AI](https://img.shields.io/badge/Powered%20by-AI-purple.svg)](https://ai.google.dev/)
[![Firebase](https://img.shields.io/badge/Database-Firebase-orange.svg)](https://firebase.google.com/)

</div>
