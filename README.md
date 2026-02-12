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

## 🏗️ System Architecture

Kabak AI operates as a **Client-Side AI Orchestration** platform. Unlike traditional apps with a heavy backend, Kabak AI leverages the browser's capabilities to manage complex workflows directly.

### Core Workflow
1.  **Input Normalization**: Raw images are cropped, centered, and optimized (1024x1024 JPEG) client-side before any API call.
2.  **Textual Analysis (SEO)**: The product image is first analyzed by `Gemini 2.0 Flash` to generate professional titles, descriptions, and hashtags.
3.  **Visual Generation**:
    *   The generated descriptions are fed back into the context.
    *   **Imagen 4.0** is triggered to generate the "Virtual Try-On" image.
    *   **Failover Logic**: If the primary model fails (e.g., 429 Limit), the system automatically switches to a fallback model or a Text-to-Image strategy.

---

## 💾 Data & Storage Strategy

Kabak AI follows a **Local-First** philosophy. Your data resides on your device.

### 1. IndexedDB (Main Storage)
Used for heavy assets to ensure the app remains fast and responsive.
*   **Products**: Stores full-resolution images (base64/blobs) and metadata.
*   **Error Logs**: comprehensive logs for debugging API failures.
*   **Usage Metrics**: Tracks detailed RPD (Requests Per Day) and cost estimation.

### 2. LocalStorage (Preferences & Sync)
Used for lightweight state and cross-tab synchronization.
*   `kabak_ai_draft`: Auto-saves the "New Product" form to prevent data loss.
*   `kabak_ai_theme`: UI Theme preference (Dark/Light).
*   `kabak_ai_lang`: Language preference (TR/EN).

### 3. Synchronization
A `BroadcastChannel` ("kabak_sync_channel") is used to instantly update the UI across multiple open tabs when a product is added or updated.

---

## � AI-Powered Features

### 📸 Input Data

#### Product Photos
* Front-facing photo (raw)
* Back-facing photo (raw)

#### Mannequin Attributes
* **Gender**
* **Age Range:** 10–50
* **Body Type:** Slim, Average, Curvy/Physique

#### Background Preference
* **Infinite Wall:** Pure Solid Orange, Black, White, Coffee (Studio Hygiene enforced)
* **Scenes:** Café interior, Urban setting

---

## 🤖 AI Models & Strategy

### Models Orchestration
The app uses a `ModelService` to manage API quotas and stability:

*   **Text/Analysis**: `gemini-2.0-flash` (Primary), `gemini-3-flash` (Fallback).
*   **Visual Generation**: `imagen-4.0-fast-generate-001` (Speed), `imagen-4.0-generate-001` (Quality).

### Limits (RPD)
*   **Gemini 2.0 Flash:** 1,500 RPD
*   **Imagen 4.0:** 500 RPD (Fast) / 100 RPD (Pro)

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
# Create a .env file in the root directory
# Add your Google Gemini API key:
VITE_GEMINI_API_KEY=your_api_key_here

# 4. Run the Client
npm run client
```

---

## 🧩 Technologies Used

### Core
* **Google Gemini 2.0 / 3.0** (AI Intelligence)
* **Imagen 4.0** (Image Generation)
* **Veo 3.1** (Video Generation - Future)

### Frontend
* **React** (UI Framework)
* **Vite** (Build Tool)
* **Tailwind CSS** (Styling)

---

## 🌐 Supported Languages

* 🇹🇷 Turkish
* 🇬🇧 English

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.
