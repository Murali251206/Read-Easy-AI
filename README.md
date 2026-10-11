# ReadEasy AI 📖✨

> **Read. Understand. Learn.**  
> A 100% free, private, and local educational reading assistant designed to break down language barriers.

Extract text from photos or documents using in-browser OCR, listen to the original text read aloud in its authentic language and accent, and get simple, structured explanations in your preferred language powered by a locally running Ollama AI model.

---

## 🌟 Key Features

- **📷 Adaptive Image Quality Enhancement (1080p / 4K / 8K)**:
  - **Automated Dimension & Quality Analysis**: Computes width, height, aspect ratio, brightness, contrast, and Laplacian sharpness variance before processing.
  - **Adaptive Resolution Tiers**:
    - *Low-resolution / Small images (<1280px longest side)*: Automatically upscaled and enhanced to **1080p tier** (~1920px longest side, e.g. 640×480 → 1440×1080), preserving the exact aspect ratio with high-quality bicubic smoothing.
    - *Medium-quality images (1280–3000px longest side)*: Enhanced up to **4K tier** (~3840px longest side) for crisp, readable characters.
    - *High-quality documents (≥3000px)*: Processed up to **8K tier** (maximum 7680px on desktop) while keeping natural resolution without bloat.
  - **Device-Aware Safety Limits**: Clamps maximum processing resolution to 4K (3840px) on mobile devices to prevent memory exhaustion, while allowing full 8K on desktop.
  - **Multi-Version Pipeline**: Generates 4 OCR-ready versions (*Normalized Color, Grayscale, High Contrast & Sharpened, Adaptive Otsu Thresholded*) while preserving the user's original image separately.
  - **Instant Cancellation**: Includes a **Cancel Processing** button during active enhancement and OCR.
  - **Image Quality Card**: Displays original vs. OCR target dimensions, contrast, sharpness score, and enhancement status.
  - **Zero Hallucination**: Enlarges pixels for OCR clarity without using generative AI to invent missing words.
  - **Step 3 — Intelligent OCR Language Selection**:
    - Automatically pairs detected or user-specified languages with optimal Tesseract models (e.g. `tam+eng`, `hin+eng`, `tel+eng`, `mal+eng`, `kan+eng`, `ara+eng`, etc.) ensuring mixed English headings, numbers, and native script are accurately recognized.
  - **Step 4 — Multi-Pass OCR Attempts**:
    - Runs multiple passes across the preprocessed variations, calculates a composite linguistic reliability score, and picks the highest-confidence extraction.
  - **Step 5 — Post-OCR Text Cleanup**:
    - Cleans scanner artifacts and isolated gridline noise while strictly preserving original wording, paragraph breaks, numbers, headings, and bullet points. Never summarizes, translates, or rewrites during OCR.
  - **Step 6 — Confidence Scoring & Difficult Image Tips**:
    - Displays clear confidence tiers (High: *Text extracted successfully*, Medium: *Please check for possible OCR mistakes*, Low: *Could not read clearly* with concrete photography tips).
  - **Step 7 — Extracted Text Review & User Verification**:
    - Extracted text is always displayed in an editable area titled **Extracted Text** so the user can verify, correct, and refine before explanation.
  - **Steps 8 & 9 — Zero Hallucination Guarantee**:
    - Never uses AI to invent or guess missing OCR text. Extracted text remains 100% faithful to the original image.

- **🌐 Smart Open-Source Language Detection**:
  - Automatic detection of Indian scripts (Tamil, Hindi, Telugu, Malayalam, Kannada, Bengali, Gujarati, Punjabi) and international languages (English, French, German, Spanish, Arabic).
  - Uses Unicode script block heuristics + statistical n-gram analysis (`franc-min`).
  - Seamless manual language selector fallback whenever detection confidence is low or text is brief.

- **🔊 Multi-Lingual Speech Synthesis (Read Aloud)**:
  - Powered by the native browser `window.speechSynthesis` API.
  - **Strict Language Separation**: The original text is **always** read aloud using its original language voice (e.g. Tamil speech code `ta-IN`, Hindi `hi-IN`, English `en-US`).
  - Explanation text is read aloud using the user's chosen explanation language voice.
  - Full playback controls: Play, Pause, Resume, and Stop.
  - Sentence chunking algorithm to prevent browser audio timeouts on long texts.

- **💡 Structured Educational Explanations (Dual Engine)**:
  - Communicates directly with your local [Ollama](https://ollama.com/) instance (`http://localhost:11434`) when running.
  - **Automatic Smart Educational Fallback**: If Ollama is offline or not installed, ReadEasy AI automatically switches to a built-in educational analysis engine so explanations **always work without any setup or paid APIs**.
  - Formatted into clean educational sections:
    1. **Simple Explanation**: Clear, beginner-friendly summary in the target language.
    2. **Key Points**: Bullet-point takeaways.
    3. **Difficult Words**: Vocabulary table with words/idioms and simple definitions.

- **🍃 MongoDB Database Integration**:
  - Automatically persists all readings, original texts, detected languages, explanations, and vocabulary to **MongoDB**.
  - View past reading history anytime using the **History** drawer.
  - Re-load any saved reading with 1 click or delete entries directly from the database.
  - Pre-configured for local MongoDB (`mongodb://127.0.0.1:27017/readeasy_ai`).

- **🛡️ 100% Free & Private**:
  - Images never leave your computer.
  - Zero third-party cloud telemetry or paid APIs.

---

## 🗺️ System Architecture & Workflow

```
┌──────────────┐     ┌──────────────┐
│ Image Upload │     │ Manual Text  │
└──────┬───────┘     └──────┬───────┘
       │                    │
       ▼                    │
┌──────────────┐            │
│ Tesseract.js │            │
│ (Client OCR) │            │
└──────┬───────┘            │
       │                    │
       ▼                    ▼
┌───────────────────────────────────┐
│           Original Text           │
│   (Editable & Correctable)        │
└─────────────────┬─────────────────┘
                  │
                  ▼
┌───────────────────────────────────┐
│    Open-Source Language Detect    │
│    (Script + N-Gram Analysis)     │
└─────────┬───────────────────────┬─┘
          │                       │
          ▼                       ▼
┌──────────────────┐    ┌──────────────────────┐
│   Read Aloud     │    │   Explain with AI    │
│ (Original Voice) │    │   (Local Ollama)     │
│  e.g. Tamil ta-IN│    │  target: English/etc.│
└──────────────────┘    └──────────┬───────────┘
                                   │
                                   ▼
                        ┌──────────────────────┐
                        │   Read Explanation   │
                        │ (Explanation Voice)  │
                        │  e.g. English en-US  │
                        └──────────────────────┘
```

---

## 🗣️ Supported Languages

The application comes pre-configured with support for 14 languages across scripts and speech codes:

| Language | Code | Speech Code (BCP 47) | Tesseract Code | Script / Family |
| :--- | :---: | :---: | :---: | :--- |
| **English** | `en` | `en-US` | `eng` | Latin |
| **Tamil** | `ta` | `ta-IN` | `tam` | Tamil (தமிழ்) |
| **Hindi** | `hi` | `hi-IN` | `hin` | Devanagari (हिन्दी) |
| **Telugu** | `te` | `te-IN` | `tel` | Telugu (తెలుగు) |
| **Malayalam** | `ml` | `ml-IN` | `mal` | Malayalam (മലയാളം) |
| **Kannada** | `kn` | `kn-IN` | `kan` | Kannada (ಕನ್ನಡ) |
| **Bengali** | `bn` | `bn-IN` | `ben` | Bengali (বাংলা) |
| **Marathi** | `mr` | `mr-IN` | `mar` | Devanagari (मराठी) |
| **Gujarati** | `gu` | `gu-IN` | `guj` | Gujarati (ગુજરાતી) |
| **Punjabi** | `pa` | `pa-IN` | `pan` | Gurmukhi (ਪੰਜਾਬੀ) |
| **French** | `fr` | `fr-FR` | `fra` | Latin (Français) |
| **German** | `de` | `de-DE` | `deu` | Latin (Deutsch) |
| **Spanish** | `es` | `es-ES` | `spa` | Latin (Español) |
| **Arabic** | `ar` | `ar-SA` | `ara` | Arabic (العربية, RTL) |

Additional languages can be added in a single line in [`lib/ocr/languages.ts`](file:///c:/Users/Muraliprasath%20B/New%20folder/ReadEasy%20AI/lib/ocr/languages.ts).

---

## 🛠️ Prerequisites

1. **Node.js**: v18.17.0 or higher (v20+ / v22+ / v24+ recommended).
   - Check version: `node -v`
2. **npm**: v9+ or higher (or pnpm / yarn).
   - Check version: `npm -v`
3. **Ollama**: (Optional for OCR & speech; required for AI explanations).
   - Free download from [ollama.com](https://ollama.com).

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies

```bash
# Navigate to the project directory
cd "ReadEasy AI"

# Install dependencies
npm install
```

### 2. Configure Environment Variables

The project includes pre-configured defaults in `.env.local`:

```env
# Ollama Local AI Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3
```

You can change `OLLAMA_MODEL` to any model you have installed in Ollama, such as:
- `llama3` (Meta Llama 3 8B)
- `llama3.1`
- `mistral` (Mistral 7B)
- `phi3` (Microsoft Phi-3)
- `qwen2.5`
- `gemma2`

### 3. Start Local Ollama Server

Make sure your Ollama daemon is running:

```bash
# Start Ollama service (if not already running in the background)
ollama serve

# Pull your preferred model (one-time download)
ollama pull llama3
```

> **Note**: Even if Ollama is not running, ReadEasy AI will still perform in-browser OCR, language detection, and audio reading aloud without interruption!

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start using ReadEasy AI.

---

## 📦 Building for Production

To create an optimized production build:

```bash
npm run build
npm run start
```

---

## 🧪 Testing the 4 Main Scenarios

You can verify the core requirements right from the UI using the one-click preset test buttons or your own inputs:

1. **Test 1 — Tamil Input**:
   - **Input**: Tamil text or image (`கல்வி என்பது ஒரு மனிதனின் வாழ்க்கையை மாற்றும்...`)
   - **Detected**: Tamil (`ta`)
   - **Read Original**: Reads using Tamil speech voice (`ta-IN`).
   - **Explain In**: English (`en`).
   - **Explanation**: AI explains the Tamil text in simple English.

2. **Test 2 — English Input**:
   - **Input**: English paragraph (e.g. on photosynthesis).
   - **Detected**: English (`en`).
   - **Read Original**: Reads using English voice (`en-US`).
   - **Explain In**: Tamil (`ta`).
   - **Explanation**: AI explains the concept in Tamil.

3. **Test 3 — Hindi Input**:
   - **Input**: Hindi text or image (`शिक्षा मनुष्य का सबसे मूल्यवान आभूषण है...`)
   - **Detected**: Hindi (`hi`).
   - **Read Original**: Reads using Hindi voice (`hi-IN`).
   - **Explain In**: English (`en`).
   - **Explanation**: AI explains the Hindi text in English.

4. **Test 4 — Tamil to Malayalam**:
   - **Input**: Tamil paragraph (`இயற்கை நமது நண்பன்...`).
   - **User Selects**: Explanation language = Malayalam (`ml`).
   - **Read Original**: Reads in Tamil (`ta-IN`).
   - **Explanation**: Explains in Malayalam (`ml-IN`).

---

## 🔧 Troubleshooting

- **Ollama connection error ("Ollama is not running at http://localhost:11434")**:
  - Run `ollama serve` in a terminal window.
  - Test if Ollama responds: Open `http://localhost:11434` in your browser. It should display *"Ollama is running"*.
- **Model not found ("model 'llama3' not found")**:
  - Run `ollama pull llama3` in your terminal.
  - Or update `OLLAMA_MODEL` in `.env.local` to match a model you already have (check installed models with `ollama list`).
- **Browser Speech voice sounds generic**:
  - Speech synthesis uses the voices installed in your OS / browser.
  - On Windows: Go to **Settings > Time & Language > Speech** or **Language** to install language packs (e.g. Tamil, Hindi).
  - Even without specific regional packs installed, the browser automatically applies the closest available synthesizer.
- **Tesseract.js language data**:
  - The first time a non-English language image is recognized, Tesseract.js fetches the language trained data dictionary (~2-4MB) and caches it in IndexedDB for subsequent offline runs.

---

## 📄 License

MIT Open Source License.
