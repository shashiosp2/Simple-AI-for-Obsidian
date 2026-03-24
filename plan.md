# Simple AI for Obsidian - Execution Plan

This plan outlines the steps to build a simple Obsidian plugin that integrates with Google Gemini, Groq, and Claude, featuring dynamic model fetching.

## 1. Project Initialization & Structure
Obsidian plugins require a specific set of files to be recognized and loaded.

**File Structure:**
```text
Simple-AI-for-Obsidian/
├── manifest.json          # Plugin metadata
├── package.json           # Dependencies (typescript, obsidian, etc.)
├── tsconfig.json          # TypeScript configuration
├── main.ts                # Entry point
├── src/
│   ├── settings.ts        # Settings tab UI logic
│   ├── providers/         # Provider-specific logic
│   │   ├── base.ts        # Abstract class for providers
│   │   ├── gemini.ts
│   │   ├── groq.ts
│   │   └── claude.ts
│   └── ui/                # Modals or complex UI components
└── styles.css             # Custom styling
```

---

## 2. Development Environment Setup
1.  **Install Dependencies:**
    ```bash
    npm init -y
    npm install obsidian @types/node typescript tsc-alias --save-dev
    ```
2.  **TypeScript Config:** Configure `tsconfig.json` to target `ESNext` and output to the root as `main.js`.
3.  **Manifest:** Create `manifest.json` with `id`, `name`, `version`, and `minAppVersion`.

---

## 3. Technical Approach: Multi-Provider Logic
Create a base class/interface that each provider (Gemini, Groq, Claude) must implement.

### A. Fetching Models Dynamically
Each provider has a different endpoint for model discovery:
*   **Google Gemini:** Use `GET https://generativelanguage.googleapis.com/v1beta/models?key={API_KEY}`. Filter for models that support `generateContent`.
*   **Groq:** Groq is OpenAI-compatible. Use `GET https://api.groq.com/openai/v1/models`.
*   **Claude (Anthropic):** Anthropic currently does **not** provide a public endpoint to list models via API. Use a "hybrid" approach:
    *   Maintain a hardcoded list of stable models (e.g., `claude-3-5-sonnet-20240620`).
    *   Provide an "Other/Custom" text field for users to manually input newer model IDs.

### B. API Communication
*   Use Obsidian's `requestUrl` instead of `fetch` to bypass CORS restrictions.

---

## 4. UI/UX Design

### Settings Tab
*   **Provider Selection:** A dropdown to choose the active provider.
*   **API Key Management:** Input fields for each provider's key.
*   **Dynamic Model Dropdown:** 
    *   A "Fetch Models" button next to the API key field.
    *   Once clicked, it populates a second dropdown with the IDs retrieved from the provider.
*   **Default System Prompt:** A text area for the global AI personality.

### Interaction Flow
*   **Ribbon Icon:** A quick-access icon to process the current selection.
*   **Command Palette:** Register commands like `Simple AI: Process Selection`.
*   **Handling Output:** Append response at the bottom or insert after selection.

---

## 5. Implementation Steps

1.  **Phase 1: Skeleton:** Setup `main.ts` and `manifest.json`.
2.  **Phase 2: Settings & Storage:** Implement `PluginSettingTab` and save keys to `data.json`.
3.  **Phase 3: Provider Services:** Implement logic for Gemini, Groq, and Claude.
4.  **Phase 4: Core Logic:** Build the "Send to AI" function.
5.  **Phase 5: UX Polish:** Add loading indicators and error notices.

---

## 6. Testing Strategy
1.  **Unit Tests:** Test the `requestUrl` payload generation.
2.  **Manual Integration:** Test with empty/large selections.
3.  **Error Handling:** Simulate API errors (401, 429) and ensure graceful failure.
