# 👗 Kabak AI - AI-Powered Fashion Visualization Platform

This project is an **AI-powered product visualization and promotion platform** developed for **clothing stores and fashion brands**.

Based on raw product photos uploaded by the user and the details they provide, it enables the creation of **realistic mannequin-based product images** and **promotional videos**.

---

## 🚀 Project Purpose

To help e-commerce businesses and physical clothing stores:

* Reduce studio shooting costs
* Showcase products quickly in different scenarios
* Produce personalized visuals and videos

---

## 🧠 AI-Powered Features

### 📸 Input Data

#### Product Photos

* Front-facing photo (raw)
* Back-facing photo (raw)

#### Mannequin Attributes

* **Gender**
* **Age Range:** 10–50
* **Body Type:**
  * Slim
  * Average
  * Plus-size

#### Product Attributes

* **Fit:**
  * Slim
  * Regular
  * Oversized

#### Background Preference

* Orange
* Black
* White
* Café interior
* Urban setting

#### Accessory Preferences

* Triangular orange-tinted sunglasses with a thin black frame
* Bag
* Wallet
* Maserati car key

#### Product Information

* Product name
* Category
* Short description (optional)

---

## 🎥 Outputs

Based on the provided information, the system generates:

* ✅ **Front product image** on a mannequin
* ✅ **Back product image** on a mannequin
* ✅ A **promotional video** for the product

---

## 🔄 Editing & Regeneration

* Generated **front/back images** can be edited again
* Videos can be regenerated
* The mannequin, background, or accessories can be changed later
* All operations are non-destructive (original data is preserved)

---

## 🧩 Technologies Used

### Core
* **Google Gemini 3.0 / 2.0** (AI Intelligence)
* **Imagen 4.0** (Image Generation)
* **Veo 2** (Video Generation)

### Frontend
* **React** (UI Framework)
* **Vite** (Build Tool)
* **Tailwind CSS** (Styling)

### Storage
* **IndexedDB** (High-capacity Client-side Storage)
* **Local Storage** (Preferences)

---

## 🛠️ Installation & Setup

### Prerequisites
* Node.js (v18+)
* npm or yarn

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/beydah/kabak-ai.git
cd kabak-ai

# 2. Install dependencies
npm install

# 3. Environment Configuration
# Create a .env file and add your Google Gemini API key
# REACT_APP_GEMINI_API_KEY=your_key_here

# 4. Run the Client
npm run client
```

---

## 🌐 Supported Languages

* 🇹🇷 Turkish
* 🇬🇧 English

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.
