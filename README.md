# BigQuery Release Notes Hub

A premium, responsive web application built with a **Python Flask** backend and a **Vanilla HTML, CSS, and JavaScript** frontend. The application fetches the official Google Cloud BigQuery release notes Atom feed, structures individual release items, filters them dynamically, and enables sharing them directly to Twitter/X.

Designed with a high-fidelity **Bento Grid** aesthetic, a cursor-tracking spotlight background, and custom conic-gradient border animations.

---

## 📖 About this Project

This application was developed as a hands-on project for the codelab:
**"Hands-on with Antigravity CLI for 5-day AI Agents: Intensive Vibe Coding Course"** (a Google X Kaggle Course). It demonstrates rapid prototyping, responsive layouts, API integration, and interactive UX designs using the Antigravity AI coding assistant agent.

---

## 🚀 Key Features

* **Procedural Bento Grid Layout:** Release note items are dynamically sized (`large`, `wide`, `tall`, or standard `1x1`) based on their layout index and content length. It creates an asymmetrical dashboard layout that collapses into a single-column layout on smaller screens.
* **Holographic Blueprint Bento Loader:** A custom-designed loading state featuring digital blueprint-grid backgrounds (`linear-gradient` mesh), a vertical scanning laser sweep line (`.scanner-line`) with glow bloom, and pulsing dashed borders. Features distinct themes: neon cyan/blue sweeps in dark theme, and neon violet/blue sweeps in light theme.
* **Delightful Latency:** Enforces a minimum loading delay (850ms) during feeds sync, allowing the holographic scan line to complete a smooth sweep animation cycle instead of flashing awkwardly.
* **Animated & Interactive Background:**
  * **Floating Orbs:** Three colored ambient orbs float and scale slowly in the background using CSS keyframe animations.
  * **Cursor Spotlight:** An interactive radial gradient spotlight that tracks and follows the user's cursor movements in real-time.
* **Collapsible Sidebar Control:** A toggle button in the header collapses/expands the left sidebar. The layout smoothly resizes using CSS transitions.
* **Synchronized Dual Filtering:** Toggle categories (Features, Issues, Changes, Deprecations) from either the sidebar checkboxes or the horizontal header chips. Active states and record count indicators automatically sync between both views.
* **Custom 'Sync Feed' Button:** Features a rotating conic-gradient border. The rotation speeds up on hover and cycles through a multi-color loading spectrum when actively synchronizing data.
* **X (Twitter) Draft Composer Modal:** A modal containing a draft tweet with a character count warning indicator. It triggers Twitter's Web Intent API to safely post updates without requiring OAuth API credentials.
* **Copy to Clipboard & CSV Export:** Clean utilities for copying update details instantly to your clipboard or exporting the currently filtered list to a downloadable CSV file.
* **Light/Dark Color Scheme Switcher:** Seamlessly swaps color profiles using root CSS custom variables. Features persistent preference saving via `localStorage`.

---

## 📁 Project Structure

* **`app.py`**: The Flask server. Handles rendering the homepage and serves the `/api/release-notes` endpoint, which fetches the Google Atom XML feed and parses it into JSON.
* **`requirements.txt`**: List of Python dependencies (Flask).
* **`templates/index.html`**: Structural semantic HTML outline, including the sidebar filter controls, bento grid skeleton structures, and the share modal.
* **`static/css/style.css`**: Design tokens, custom scrollbars, keyframe definitions, layout sizing, and bento grid variables.
* **`static/js/app.js`**: Core client-side controller. Handles loading state toggles, cursor tracking, filter synchronization, search query binding, bento card generation, and modal triggers.
* **`.gitignore`**: Pattern file to ignore byte-caches, editor settings, and virtual environment directories.

---

## ⚙️ Installation & Setup

### Prerequisites
* Python 3.x installed on your system.

### 1. Clone the repository
```bash
git clone https://github.com/asti-nisrina02/asti-nisrina02-16june-2026-event-talks-app.git
cd asti-nisrina02-16june-2026-event-talks-app
```

### 2. Set up virtual environment (Optional but Recommended)
```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the application
```bash
python app.py
```

### 5. View in browser
Open your browser and navigate to:
👉 **[http://localhost:5005](http://localhost:5005)**

---

## 🛠️ Tech Stack

* **Backend:** Python, Flask
* **Frontend:** Vanilla HTML5, Vanilla CSS3 (Custom Variables, CSS Grid, Transitions), Vanilla ES6 JavaScript (Fetch API, DOM Events)
* **API Feed Source:** [Google Cloud BigQuery Release Notes Feed](https://docs.cloud.google.com/feeds/bigquery-release-notes.xml)
* **Fonts:** [Outfit (Google Fonts)](https://fonts.google.com/specimen/Outfit)
