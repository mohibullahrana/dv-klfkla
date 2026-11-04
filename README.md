# DCU Post Generator

Instagram-inspired custom post & profile card generator for Dhaka Central University students.

Create personalized university-themed Instagram-style posts by entering text, uploading a photograph, previewing the design, and downloading a high-quality JPG image.

## Features

- **Multilingual support**: English, Bangla, and mixed text
- **Custom fonts**: Constantia (English) + Kalpurush (Bangla)
- **Live character counters** with limits
- **Background-removed photo upload** with instant preview
- **Pixel-accurate design** matching the official reference template
- **High-quality JPG export** (1080×1080)
- **Fully responsive** (desktop, tablet, mobile)
- **No backend required** – works entirely in the browser

## Project Structure

```
DCU-Post-Generator/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
├── assets/
│   ├── bg.png              # Main background
│   ├── dcu.png             # Dhaka Central University logo
│   ├── synergy.png         # Synergy 16 logo
│   ├── constan.ttf         # Constantia bold font
│   └── kalpurush.ttf       # Kalpurush Bangla font
└── README.md
```

## How to Run

1. Open the project folder in any modern browser (Chrome, Firefox, Edge, Safari).
2. Simply double-click `index.html` or serve it with a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node (npx)
npx serve .
```

3. Navigate to `http://localhost:8000` (or the port shown).

> **Note**: Because of browser security restrictions around custom fonts and canvas, serving via a local HTTP server is recommended over opening the file directly (`file://`).

## Usage

1. **Context / Quote** – Enter your message (max 170 characters). Supports Bangla, English, or mixed.
2. **Name** – Your name (max 16 characters).
3. **Identity** – e.g. “Student, Dhaka Central University” (max 40 characters).
4. **Photograph** – Upload a background-removed image (recommended).  
   Use the link “Make photo background removed” to open remove.bg in a new tab.
5. Click **Generate Post** to render the card.
6. Click **Download JPG** to save the 1080×1080 image.
7. Click **New / Reset** to clear everything and start over.

## Design Notes

- Canvas size: **1080 × 1080** (Instagram square post)
- Primary colors: Deep Blue `#0B2953`, Burgundy `#862222`, White, Light Gray
- Quote text: 44px, dark maroon
- Name: 54px white on burgundy banner
- Identity: 28px white
- Logos positioned exactly as in the reference design
- Photo placed bottom-right, overlapping the bottom banner

## Browser Support

Works on all modern browsers that support:
- HTML5 Canvas
- `@font-face` with TrueType fonts
- ES6 JavaScript

Tested on Chrome, Firefox, Edge, and Safari.

## Credits

Developed by **Mhb Rana**

Assets and design inspired by Dhaka Central University / Synergy 16 materials.
