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

### Frontend

* **React**
* **Vite**
* **Tailwind CSS**

### Backend

* **Node.js**

### State & Preferences

* **Local Storage**
  * Language preference
  * Theme (light / dark)
  * User settings

---

## 🎨 UI & UX Approach

* Mobile-first design
* Atomic Design principles
* Light / Dark theme support
* Non-repetitive, scalable component architecture

---

# Clone the repository
git clone https://github.com/beydah/kabak-ai.git
cd kabak-ai

# Install dependencies
npm install

# Run the client (development)
npm run dev:client

# Run the server (development)
npm run dev:server
```

---

## 📁 Project Structure

```
kabak-ai/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/     # Atomic Design components
│   │   │   ├── atoms/      # Basic UI elements
│   │   │   ├── molecules/  # Composite components
│   │   │   ├── organisms/  # Complex sections
│   │   │   └── templates/  # Page layouts
│   │   ├── pages/          # Route pages
│   │   ├── locales/        # i18n translations (TR/EN)
│   │   ├── utils/          # Helper functions
│   │   └── routes/         # Router configuration
├── server/                 # Node.js backend
│   └── src/
│       ├── controllers/
│       ├── services/
│       └── routes/
└── shared/                 # Shared types & constants
```

---

## 🌐 Supported Languages

* 🇹🇷 Turkish
* 🇬🇧 English

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.
