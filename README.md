# Keystra — Typing Fitness Tracker

Keystra is a beautiful, feature-rich desktop typing fitness tracker that records and analyzes typing metrics in real-time across all your applications. By leveraging a low-level global keyboard hook, Keystra monitors key press frequency, typing speed (Words Per Minute), accuracy, transition rhythm (digraphs), and key hold latency. It categorizes your activities (Coding, Writing, Chatting, Browsing) to provide deep, actionable insights into your keyboard productivity and habits.

---

## 🚀 Features

- **Global Raw Keystroke Tracking**: Captured via a high-performance, low-level Windows Hook executable (`KeystraHook.exe`) that operates silently in the background.
- **Interactive Live Overlay**: A floating, semi-transparent window showing real-time WPM, accuracy, session duration, and the active application. It features dynamic click-through ignore-mouse behavior so it never disrupts your workflow.
- **Rich Analytics Dashboard**:
  - **Dynamic Keyboard Heatmap**: A visual representation of your keyboard, highlighting the keys you press most frequently.
  - **Categorized Focus Tracking**: Automatically tracks time spent across different tasks (Coding, Chatting, Writing, Browsing, and Others) based on active window title/process name detection.
  - **Speed & Rhythm Analytics**: View typing performance graphs, average WPM, peak speed, accuracy trends, and typing session fatigue.
- **System Tray Integration**: Minimize Keystra to the system tray so it runs in the background. Quickly toggle the dashboard or floating overlay.
- **Clean Onboarding Experience**: Smooth, friendly onboarding tutorial to guide new users on how Keystra works.

---

## 🛠️ Architecture

Keystra is built using a modern desktop stack:
1. **Frontend**: [React 19](https://react.dev/), [Vite](https://vite.dev/), [Tailwind CSS](https://tailwindcss.com/), and [Lucide React](https://lucide.dev/) icons.
2. **Desktop Shell**: [Electron 43](https://www.electronjs.org/), orchestrating main/preload processes and IPC communication.
3. **Core Metric Processor**: A custom JavaScript metrics engine (`src/main/metrics.js`) that analyzes typing bursts, digraph transitions, hold latencies, and updates local file storage.
4. **Low-Level Native Hook**: A native C# utility (`KeystraHook.exe`) that captures keyboard events globally (active in Windows) and streams them to Electron stdout as JSON lines.

---

## 📂 Project Directory Structure

```text
├── release/                     # Compiled binaries (executable output)
├── src/
│   ├── hook/                    # C# low-level hook source and binary
│   │   └── KeystraHook.exe      # Windows Global Keyboard Hook
│   ├── main/                    # Electron Main Process files
│   │   ├── main.js              # Application lifecycle, IPC, window management
│   │   ├── preload.js           # Secure IPC bridge for renderer contexts
│   │   ├── store.js             # Local JSON data store management
│   │   └── metrics.js           # Analytics processor (WPM, Accuracy, Digraphs)
│   └── renderer/                # React 19 Frontend codebase (Vite SPA)
│       ├── App.jsx              # Main App wrapper & routing
│       ├── Dashboard.jsx        # Real-time metrics dashboard
│       ├── Analytics.jsx        # Trends, graphs, and category statistics
│       ├── Heatmap.jsx          # Visual interactive keyboard heatmap
│       ├── Onboarding.jsx       # Welcome guide and configuration
│       ├── OverlayApp.jsx       # Interactive floating widget
│       ├── index.css            # Tailwind CSS styling entries
│       └── main.jsx             # React entrypoint
├── index.html                   # Dashboard HTML entrypoint
├── overlay.html                 # Overlay HTML entrypoint
├── start.js                     # Dev script runner
├── package.json                 # Project configuration and script commands
└── tailwind.config.js           # Tailwind utility config
```

---

## 💻 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)
- **Windows OS** (required for `KeystraHook.exe` global keyboard hook execution)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/piyush-1803/Keystra.git
   cd Keystra
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

### Running in Development

To start the Vite development server and Electron in development mode:
```bash
npm start
```
*Note: In development mode, the app loads from `http://localhost:5173`. Double-check that Vite has launched successfully.*

---

## 📦 Building and Packaging

To compile the React frontend bundle and package the application into a portable Windows executable (`release/Keystra 1.0.0.exe`):

```bash
npm run package
```

This runs `npm run build` (Vite production compiling) followed by `electron-builder` to bundle the app and the hook binary together. The output will be located in the `release/` directory.

---

## 💾 Prebuilt Executables & Releases

Because standard Git repositories are not meant to store heavy compiled binaries (and to avoid GitHub's 100MB single-push limit), the prebuilt executable (`Keystra 1.0.0.exe`) is distributed via **GitHub Releases**.

To download the latest stable version:
1. Navigate to the [Releases page](https://github.com/piyush-1803/Keystra/releases) on this repository.
2. Download the `Keystra 1.0.0.exe` executable.
3. Run the executable directly. It is completely portable and does not require a formal installation setup.

---

## 🛡️ License

This project is licensed under the ISC License. See the [package.json](package.json) file for details.
