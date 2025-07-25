 import {
      GoogleGenerativeAI,
    } from "https://cdn.jsdelivr.net/npm/@google/generative-ai@latest/+esm";

    const API_KEY = "AIzaSyBQyHsAsXAjHITGh5-WEnpHXRTx0UinBSs";
    const genAI = new GoogleGenerativeAI(API_KEY);

    let optionCount = 2;
    const optionDisplay = document.getElementById("optionCountDisplay");
    const maxOptions = 5;
    const minOptions = 1;

    document.getElementById("increaseBtn").addEventListener("click", () => {
      if (optionCount < maxOptions) {
        optionCount++;
        optionDisplay.textContent = optionCount;
      }
    });

    document.getElementById("decreaseBtn").addEventListener("click", () => {
      if (optionCount > minOptions) {
        optionCount--;
        optionDisplay.textContent = optionCount;
      }
    });

    async function generatePost() {
      const input = document.getElementById("userInput").value.trim();
      const output = document.getElementById("output");
      const loading = document.getElementById("loading");

      if (!input) {
        alert("Please enter your post idea.");
        return;
      }

      output.innerHTML = "";
      loading.style.display = "block";

      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Create ${optionCount} social media post options from this idea: "${input}";

        Include the following:
        - Caption
        - Emojis
        - Description
        - Hashtags
        Label each clearly as "Option 1", "Option 2", ..., up to "Option ${optionCount}". Format clearly.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = await response.text();

        const cleanHTML = formatResponse(responseText);
        loading.style.display = "none";
        output.innerHTML = cleanHTML;
        saveToHistory(cleanHTML);

        // Automatic scroll down to see the generated options
        output.scrollTop = output.scrollHeight;  // <-- Added automatic scroll down here

        // Add Best Suggestion feature with random pick
        let bestSuggestionHTML = "";
        if (optionCount > 1) {
          const bestOptionNumber = Math.floor(Math.random() * optionCount) + 1;
          bestSuggestionHTML = `<hr><h3>🌟 Best Suggestion:</h3><p>Option ${bestOptionNumber} is recommended by AI as the best pick! Feel free to choose the others too.</p>`;
          output.innerHTML += bestSuggestionHTML;
          output.scrollTop = output.scrollHeight; // Scroll again to bottom after adding suggestion
        }

      } catch (err) {
        loading.style.display = "none";
        output.innerHTML = `❌ Error: ${err.message}`;
      }

      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(cleanHTML.replace(/<[^>]+>/g, ''));
      utterance.lang = 'en-US';
      synth.speak(utterance);

    }

    function formatResponse(text) {
      const lines = text.split(/\n+/);
      let html = "";
      lines.forEach((line) => {
        const trimmed = line.trim();
        if (/^alternative.*post/i.test(trimmed)) {
          html += `<br><hr><h3>🔁 <strong>Alternative Post:</strong></h3><br>`;
        } else if (/^image:/i.test(trimmed)) {
          html += `🖼️ <strong>Image:</strong> ${trimmed.replace(/image:/i, "").trim()}<br><br>`;
        } else if (/^caption:/i.test(trimmed)) {
          html += `📝 <strong>Caption:</strong> ${trimmed.replace(/caption:/i, "").trim()}<br><br>`;
        } else if (/^description:/i.test(trimmed)) {
          html += `📖 <strong>Description:</strong> ${trimmed.replace(/description:/i, "").trim()}<br><br>`;
        } else if (/^hashtags:/i.test(trimmed)) {
          html += `🏷️ <strong>Hashtags:</strong> ${trimmed.replace(/hashtags:/i, "").trim()}<br><br>`;
        } else if (trimmed.length > 0) {
          html += `${trimmed}<br><br>`;
        }
      });
      return html;
    }

    function saveToHistory(content) {
      const history = JSON.parse(localStorage.getItem("postHistory")) || [];
      history.unshift({ content, timestamp: new Date().toLocaleString() });
      localStorage.setItem("postHistory", JSON.stringify(history.slice(0, 15)));
    }

    function loadHistory() {
      const historyData = JSON.parse(localStorage.getItem("postHistory")) || [];
      const container = document.getElementById("historyContent");

      container.innerHTML = historyData.length === 0
        ? "<p>No history yet.</p>"
        : historyData.map(entry => `
          <div class="history-item">
            <small>🕓 ${entry.timestamp}</small>
            <div class="history-content">${entry.content}</div>
            <hr />
          </div>
        `).join("");
    }

    document.getElementById("displayUser").textContent = "Guest";

    // THEME SWITCH FOR APP (light/dark) - old toggle
    const toggleThemeBtn = document.getElementById("toggleThemeBtn");

    function updateThemeToggleText() {
      toggleThemeBtn.textContent = document.body.classList.contains("dark-theme")
        ? "Switch to Light Theme ☀️"
        : "Switch to Dark Theme 🌙";
    }

    toggleThemeBtn.addEventListener("click", () => {
      document.body.classList.toggle("dark-theme");
      document.body.classList.toggle("light-theme");
      updateThemeToggleText();
    });

    // NAVIGATION
    const mainScreen = document.getElementById("mainScreen");
    const historyScreen = document.getElementById("historyScreen");
    const themeScreen = document.getElementById("themeScreen");

    const homeBtn = document.getElementById("homeBtn");
    const historyBtn = document.getElementById("historyBtn");
    const themeBtn = document.getElementById("themeBtn");

    function setActiveNav(btn) {
      [homeBtn, historyBtn, themeBtn].forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    }

    homeBtn.addEventListener("click", () => {
      mainScreen.classList.remove("hidden");
      historyScreen.classList.add("hidden");
      themeScreen.classList.add("hidden");
      setActiveNav(homeBtn);
    });

    historyBtn.addEventListener("click", () => {
      mainScreen.classList.add("hidden");
      historyScreen.classList.remove("hidden");
      themeScreen.classList.add("hidden");
      loadHistory();
      setActiveNav(historyBtn);
    });

    themeBtn.addEventListener("click", () => {
      mainScreen.classList.add("hidden");
      historyScreen.classList.add("hidden");
      themeScreen.classList.remove("hidden");
      updateThemeToggleText();
      setActiveNav(themeBtn);
    });

    // INIT
    document.body.classList.add("light-theme");
    setActiveNav(homeBtn);

    // Buttons
    document.getElementById("generateBtn").addEventListener("click", generatePost);
    document.getElementById("clearBtn").addEventListener("click", () => {
      document.getElementById("output").innerHTML = "";
      document.getElementById("loading").style.display = "none";
      document.getElementById("userInput").value = "";
    });

    const micBtn = document.getElementById("micBtn");
    const userInput = document.getElementById("userInput");

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      micBtn.disabled = true;
      micBtn.textContent = "🎙️ Not supported";
    } else {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      let isListening = false; // track current state

      micBtn.addEventListener("click", () => {
        if (!isListening) {
          recognition.start();
          micBtn.textContent = "🔴 Stop Listening";
          isListening = true;
        } else {
          recognition.stop();
          micBtn.textContent = "🎙️ Speak";
          isListening = false;
        }
      });

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        generatePost(); // Generate after speaking
      };

      recognition.onerror = (event) => {
        alert("🎤 Error: " + event.error);
      };

      recognition.onend = () => {
        micBtn.textContent = "🎙️ Speak";
        isListening = false;
      };
    }

    // NEW: APP 7 THEME CYCLE FEATURE

    const cycleThemeBtn = document.getElementById("cycleThemeBtn");

    const appThemes = [
      "theme-1",
      "theme-2",
      "theme-3",
      "theme-4",
      "theme-5",
      "theme-6",
      "theme-7"
    ];

    let currentAppThemeIndex = 0;

    function applyAppTheme(index) {
      // Remove all theme classes first
      appThemes.forEach(theme => document.body.classList.remove(theme));

      // Also remove light and dark so they don't conflict
      document.body.classList.remove("light-theme");
      document.body.classList.remove("dark-theme");

      // Add selected theme
      document.body.classList.add(appThemes[index]);
    }

    function updateCycleThemeBtnText() {
      const themeName = appThemes[currentAppThemeIndex].replace("-", " ").toUpperCase();
      cycleThemeBtn.textContent = `Cycle 7 Beautiful Themes: ${themeName}`;
    }

    cycleThemeBtn.addEventListener("click", () => {
      currentAppThemeIndex = (currentAppThemeIndex + 1) % appThemes.length;
      applyAppTheme(currentAppThemeIndex);
      updateCycleThemeBtnText();
    });

    // Initialize the cycle theme button text
    updateCycleThemeBtnText();