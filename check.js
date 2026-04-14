
    const BASE_URL = 'http://localhost:8000';
    let currentContext = null;

    // High risk tags for coloring
    const HIGH_RISK = ["Passwords", "Password hints", "Credit cards", "Bank account numbers", "Private messages", "Social security numbers", "Auth tokens"];

    /* ── API Status Check ────────────────────────────────────────────── */
    async function checkStatus() {
      const dot = document.getElementById('apiDot');
      const txt = document.getElementById('apiStatusText');
      try {
        const r = await fetch(BASE_URL + '/', { signal: AbortSignal.timeout(3000) });
        if (r.ok) {
          dot.className = 'status-dot online';
          txt.textContent = 'API Online';
        } else throw new Error();
      } catch {
        dot.className = 'status-dot offline';
        txt.textContent = 'API Offline';
      }
    }
    checkStatus(); setInterval(checkStatus, 15000);

    /* ── Homepage Navigation: Smooth Scroll & Active State ───────────── */
    function smoothScroll(selector) {
      const el = document.querySelector(selector);
      if (!el) return;
      // Nav is now inline in the header — only one sticky bar (~65px)
      const offset = 90;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }

    // Prevent default anchor jump and delegate to smoothScroll
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        smoothScroll(href);
      });
    });

    // Highlight active nav link based on scroll position
    const navSections = [
      { id: 'section-features', navId: 'nav-features' },
      { id: 'section-pipeline', navId: 'nav-pipeline' },
      { id: 'section-architecture', navId: 'nav-arch' },
      { id: 'section-scoring', navId: 'nav-scoring' },
      { id: 'section-wiki', navId: 'nav-wiki' },
    ];

    function updateActiveNav() {
      const scrollY = window.scrollY + 200;
      let activeId = null;
      navSections.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top + window.scrollY - 200 <= scrollY) {
          activeId = id;
        }
      });
      navSections.forEach(({ id, navId }) => {
        const link = document.getElementById(navId);
        if (link) link.classList.toggle('active', id === activeId);
      });
    }

    window.addEventListener('scroll', updateActiveNav, { passive: true });

    // Fade nav links out during scan (opacity only — keeps header grid intact)
    function updateNavVisibility() {
      const nav = document.getElementById('home-nav');
      const dashboard = document.getElementById('dashboard-section');
      const loading = document.getElementById('loading-section');
      if (!nav) return;
      const scanActive = dashboard.style.display === 'block' ||
        loading.style.display === 'flex';
      nav.classList.toggle('hidden', scanActive);
    }

    /* ── Secret Shortcuts & Interactive UI ───────────────────────────── */
    document.addEventListener('keydown', (e) => {
      // Secret Demo Mode (Ctrl+D or Cmd+D)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        runDemoMode();
      }
    });

    document.addEventListener('mousemove', (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      const bg = document.querySelector('.bg-animation');
      bg.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(124, 58, 237, 0.15) 0%, transparent 40%),
                             radial-gradient(circle at ${(1 - x) * 100}% ${(1 - y) * 100}%, rgba(0, 240, 255, 0.1) 0%, transparent 40%)`;
    });

    // Spawn lively floating data nodes
    for (let i = 0; i < 20; i++) {
      const node = document.createElement('div');
      node.className = 'floating-node';
      const size = Math.random() * 4 + 2;
      node.style.width = size + 'px';
      node.style.height = size + 'px';
      node.style.left = Math.random() * 100 + 'vw';
      node.style.top = Math.random() * 100 + 'vh';
      node.style.animationDuration = (Math.random() * 10 + 5) + 's';
      node.style.animationDelay = (Math.random() * 5) + 's';
      if (Math.random() > 0.5) {
        node.style.background = 'var(--purple2)';
        node.style.boxShadow = 'var(--glow-purple)';
      }
      document.body.appendChild(node);
    }

    // Faux Background Terminal (Live Telemetry Matrix)
    const vectors = ["credential_stuffing", "brute_force", "sqli_attempt", "api_abuse", "zero_day"];
    const statuses = ["BLOCKED", "INTERCEPTED", "NULL_ROUTED", "ANALYZING"];
    const bgTerminal = document.getElementById('bg-terminal');

    setInterval(() => {
      if (document.getElementById('dashboard-section').style.display === 'block') return;
      const p = document.createElement('div');
      const hash = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 6);
      const vec = vectors[Math.floor(Math.random() * vectors.length)];
      const stat = statuses[Math.floor(Math.random() * statuses.length)];
      const lat = Math.floor(Math.random() * 80) + 12;

      p.textContent = `{ "node": "eu-central", "hash": "${hash}", "vector": "${vec}", "ms": ${lat}, "status": "${stat}" }`;
      bgTerminal.appendChild(p);
      if (bgTerminal.children.length > 25) bgTerminal.firstChild.remove();
    }, 400);

    // Terminal Title Typewriter
    const titleStr = "Assess Your Digital Exposure";
    let titleIdx = 0;
    const titleEl = document.getElementById('hero-title');
    titleEl.innerHTML = '';
    function typeTitle() {
      if (titleIdx <= titleStr.length) {
        titleEl.innerHTML = titleStr.substring(0, titleIdx) + '<span class="cursor" style="animation: blink 1s infinite">_</span>';
        titleIdx++;
        if (titleIdx <= titleStr.length) setTimeout(typeTitle, Math.random() * 60 + 40);
      }
    }
    setTimeout(typeTitle, 400);

    /* ── Sound Design (Web Audio API) ─────────────────────────────────── */
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;

    function initAudio() {
      if (!audioCtx) audioCtx = new AudioContext();
      if (audioCtx.state === 'suspended') audioCtx.resume();
    }

    function playSound(type) {
      if (!audioCtx) return;
      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        const now = audioCtx.currentTime;
        if (type === 'blip') {
          // Soft modern UI click
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
          gain.gain.setValueAtTime(0.05, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
          osc.start(now);
          osc.stop(now + 0.05);
        } else if (type === 'tick') {
          // Subtle mechanical typing tick
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(1200, now);
          gain.gain.setValueAtTime(0.02, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
          osc.start(now);
          osc.stop(now + 0.03);
        } else if (type === 'alert-high') {
          // Double warning beep, less abrasive than pure sawtooth
          osc.type = 'square';
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.setValueAtTime(250, now + 0.15);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.linearRampToValueAtTime(0.001, now + 0.1);
          gain.gain.setValueAtTime(0.08, now + 0.15);
          gain.gain.linearRampToValueAtTime(0.001, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.3);
        } else if (type === 'alert-low') {
          // Pleasant soft success chime
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, now); // C5
          osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
          gain.gain.setValueAtTime(0.0, now);
          gain.gain.linearRampToValueAtTime(0.05, now + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
          osc.start(now);
          osc.stop(now + 0.4);
        }
      } catch (e) { }
    }

    /* ── Utilities ───────────────────────────────────────────────────── */
    function prefill(val) {
      initAudio(); playSound('blip');
      document.getElementById('target-input').value = val;
      runAnalysis();
    }

    function switchView(view) {
      document.getElementById('hero-section').style.display = view === 'hero' ? 'block' : 'none';
      document.getElementById('loading-section').style.display = view === 'loading' ? 'flex' : 'none';
      document.getElementById('dashboard-section').style.display = view === 'dash' ? 'block' : 'none';
      document.getElementById('threat-ticker-container').style.display = view === 'hero' ? 'flex' : 'none';
      updateNavVisibility();
    }

    function resetUI() {
      initAudio(); playSound('blip');
      document.getElementById('target-input').value = '';
      currentContext = null;
      switchView('hero');
    }

    /* ── Product Features ─────────────────────────────────────────────── */
    function downloadPDF() {
      initAudio(); playSound('blip');
      const element = document.getElementById('dashboard-section');
      const opt = {
        margin: 0.3,
        filename: 'TraceZero_Report.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      html2pdf().set(opt).from(element).save();
    }

    /* ── Demo Mode ────────────────────────────────────────────────────── */
    function runDemoMode() {
      initAudio(); playSound('blip');
      const input = document.getElementById('target-input');
      input.value = '';
      const demoEmail = 'admin@example.com';
      let i = 0;
      const typeInterval = setInterval(() => {
        input.value += demoEmail.charAt(i);
        playSound('tick');
        i++;
        if (i >= demoEmail.length) {
          clearInterval(typeInterval);
          setTimeout(runAnalysis, 500);
        }
      }, 50);
    }

    /* ── Main Analysis Flow ──────────────────────────────────────────── */
    async function runAnalysis() {
      initAudio(); playSound('blip');
      const input = document.getElementById('target-input').value.trim();
      if (!input) return;

      switchView('loading');

      const messages = ["Cross-referencing digital records...", "Scanning deep web matrices...", "Checking threat intelligence nodes...", "Analyzing semantic risk patterns..."];
      let msgIdx = 0;
      const tId = setInterval(() => {
        msgIdx = (msgIdx + 1) % messages.length;
        document.getElementById('loading-msg').textContent = messages[msgIdx];
      }, 1500);

      try {
        const res = await fetch(`${BASE_URL}/analyze?input=${encodeURIComponent(input)}`);
        const data = await res.json();

        clearInterval(tId);
        if (!res.ok) throw new Error(data.detail || "API Error");

        renderDashboard(data);
        switchView('dash');

        if (data.severity === "HIGH") {
          setTimeout(() => playSound('alert-high'), 300);
        } else {
          setTimeout(() => playSound('alert-low'), 300);
        }
      } catch (err) {
        clearInterval(tId);
        alert("Error: " + err.message + "\nEnsure server is running (uvicorn main:app --reload)");
        switchView('hero');
      }
    }

    /* ── Render Dashboard DOM ────────────────────────────────────────── */
    function renderDashboard(data) {
      // Create context string for chatbot
      currentContext = `Target: ${data.input}\nScore: ${data.risk_score}/100\nSeverity: ${data.severity}\nSummary: ${data.summary}`;

      // Title
      document.getElementById('report-target').textContent = data.input;

      // Gauge & Score
      const gauge = document.getElementById('score-gauge');
      const scoreTxt = document.getElementById('score-text');
      const score = data.risk_score || 0;

      setTimeout(() => {
        gauge.style.strokeDasharray = `${score}, 100`;
      }, 100);

      let startObj = { val: 0 };
      let end = score;
      let duration = 1500;
      let startT = null;
      function iter(t) {
        if (!startT) startT = t;
        let p = Math.min((t - startT) / duration, 1);
        scoreTxt.textContent = Math.floor(p * end) + '%';
        if (p < 1) requestAnimationFrame(iter);
      }
      requestAnimationFrame(iter);

      // Severity Badge
      const badge = document.getElementById('severity-badge');
      const sev = data.severity.toUpperCase();
      badge.textContent = sev + " RISK";
      badge.className = 'severity-badge';
      let gaugeColorClass = 'sev-none';
      if (sev === "HIGH") gaugeColorClass = 'sev-high';
      else if (sev === "MEDIUM") gaugeColorClass = 'sev-medium';
      else if (sev === "LOW") gaugeColorClass = 'sev-low';

      badge.classList.add(gaugeColorClass);
      gauge.className.baseVal = "gauge-progress " + gaugeColorClass;

      // Render Chart.js
      const ctx = document.getElementById('exposureChart').getContext('2d');
      if (window.exposureChartInstance) {
        window.exposureChartInstance.destroy();
      }
      let chartLabels = [];
      let chartData = [];
      let chartColors = [];
      if (data.breakdown && data.breakdown.length > 0) {
         let counts = {};
         data.breakdown.forEach(b => {
             b.compromised_data.forEach(d => {
                 counts[d] = (counts[d] || 0) + 1;
             });
         });
         chartLabels = Object.keys(counts);
         chartData = Object.values(counts);
         chartColors = chartLabels.map(l => HIGH_RISK.includes(l) ? 'rgba(239, 68, 68, 0.8)' : 'rgba(0, 240, 255, 0.5)');
      } else {
         chartLabels = ['Secure'];
         chartData = [100];
         chartColors = ['rgba(16, 185, 129, 0.8)'];
      }
      window.exposureChartInstance = new Chart(ctx, {
          type: 'doughnut',
          data: {
              labels: chartLabels,
              datasets: [{
                  data: chartData,
                  backgroundColor: chartColors,
                  borderColor: 'rgba(6, 8, 13, 1)',
                  borderWidth: 2
              }]
          },
          options: {
              responsive: true,
              maintainAspectRatio: false,
              cutout: '70%',
              plugins: {
                  legend: {
                      display: false
                  }
              }
          }
      });

      // Summary & Tags
      document.getElementById('summary-text').textContent = data.summary;
      const tagsBox = document.getElementById('risk-tags-container');
      if (data.top_risks && data.top_risks.length > 0) {
        tagsBox.innerHTML = data.top_risks.map(r =>
          `<span class="risk-tag" style="border-color:${HIGH_RISK.includes(r) ? '#ef4444' : 'var(--border)'}; color:${HIGH_RISK.includes(r) ? '#fca5a5' : 'var(--text)'}">${r}</span>`
        ).join('');
      } else {
        tagsBox.innerHTML = '<span class="risk-tag" style="background:var(--green-glow);border-color:var(--green);color:var(--green);">Clean</span>';
      }

      // Metric Cards
      const lcNum = data.signals?.leakcheck_found || 0;
      document.getElementById('val-leaks').textContent = lcNum;
      document.getElementById('sub-leaks').textContent = "Database Index";

      // Hunter logic
      let isRisky = data.signals?.email_risky || data.signals?.email_disposable;
      if (data.input_type !== 'email') {
        document.getElementById('val-hunter').textContent = "N/A";
        document.getElementById('sub-hunter').textContent = "Username input";
      } else {
        document.getElementById('val-hunter').textContent = isRisky ? "Risky" : "Safe";
        document.getElementById('val-hunter').style.color = isRisky ? "var(--yellow)" : "var(--green)";
        document.getElementById('sub-hunter').textContent = data.signals?.email_disposable ? "Disposable email used" : "Status check";
      }

      // VT logic
      const isFlagged = data.signals?.domain_flagged;
      document.getElementById('val-vt').textContent = isFlagged ? 'Flagged' : 'Clean';
      document.getElementById('val-vt').style.color = isFlagged ? 'var(--red)' : 'var(--green)';

      // Social
      document.getElementById('val-social').textContent = data.signals?.social_mentions || 0;

      // Actionable Suggestions
      const reqList = document.getElementById('suggestions-list');
      let suggestions = [];
      if (lcNum > 0 || score > 30) {
        suggestions.push("Immediately change passwords for any compromised or shared accounts.");
        suggestions.push("Enable Multi-Factor Authentication (MFA) on your most critical accounts (Banking, Email).");
        suggestions.push("Use a dedicated password manager to generate and store unique credentials.");
      }
      if (isRisky) {
        suggestions.push("Your email is flagged as risky or disposable. Avoid using it for sensitive registrations.");
      }
      if (isFlagged) {
        suggestions.push("Your email domain is flagged by security networks. Avoid downloading unverified attachments from this domain.");
      }
      if (data.signals?.social_mentions > 50) {
        suggestions.push("Your public footprint is high. Review privacy settings on your social media platforms to minimize OSINT exposure.");
      }
      if (suggestions.length === 0) {
        suggestions.push("Your digital identity appears highly secure. Keep up the excellent security hygiene!");
      }
      reqList.innerHTML = suggestions.map(s => `<li>${s}</li>`).join('');

      // Breaches List
      const bWrapper = document.getElementById('breaches-wrapper');
      const bList = document.getElementById('breach-list');
      const bCount = document.getElementById('breach-count-text');

      if (data.breakdown && data.breakdown.length > 0) {
        bWrapper.style.display = 'block';
        bCount.textContent = data.breakdown.length;
        bList.innerHTML = data.breakdown.map((b, i) => {
          const dataTags = b.compromised_data.map(d => {
            const isHigh = HIGH_RISK.includes(d) ? 'high' : '';
            return `<span class="data-pill ${isHigh}">${d}</span>`;
          }).join('');

          const domainMatch = b.breach.toLowerCase().replace(/[^a-z0-9]/g, '');
          const fallbackLogo = 'data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23aaa%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><circle cx=%2212%22 cy=%2212%22 r=%2210%22></circle><line x1=%2212%22 y1=%228%22 x2=%2212%22 y2=%2212%22></line><line x1=%2212%22 y1=%2216%22 x2=%2212.01%22 y2=%2216%22></line></svg>';
          // If the breach string matches "rockyou", maybe try a generic icon, but Clearbit usually fails gracefully
          const logoUrl = `https://logo.clearbit.com/${domainMatch}.com`;
          
          const scorePercent = (b.score / 10) * 100;
          const scoreColor = b.severity === 'HIGH' ? 'var(--red)' : (b.severity === 'MEDIUM' ? 'var(--yellow)' : 'var(--green)');

          return `
            <div class="breach-item slide-in" style="animation-delay: ${i * 0.15}s; display: flex; align-items: flex-start; gap: 20px; border-left-color: ${scoreColor}; background: rgba(0,0,0,0.4); padding: 20px; border-radius: 8px;">
               <div style="flex: 0 0 54px; height: 54px; border-radius: 8px; background: #fff; overflow: hidden; display: flex; align-items: center; justify-content: center; padding: 6px;">
                  <img src="${logoUrl}" onerror="this.src='${fallbackLogo}'" style="width: 100%; height: 100%; object-fit: contain;">
               </div>
               <div class="breach-info" style="flex: 1;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                      <h4 style="margin: 0 0 6px 0; font-size: 1.25rem; color: #fff;">${b.breach}</h4>
                      <span class="breach-date" style="font-size: 0.85rem; color: var(--muted);"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px; vertical-align:middle;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> ${b.date}</span>
                    </div>
                    <div class="breach-score" style="text-align:right">
                      <div style="font-weight:800; font-size: 1.1rem; color: ${scoreColor}">${b.severity} RISK</div>
                      <div style="font-size:0.85rem; color:var(--muted); margin-top: 2px;">Impact: ${b.score}/10</div>
                    </div>
                  </div>
                  
                  <div style="margin-top: 14px; margin-bottom: 14px;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--muted); margin-bottom: 6px;">
                      <span>Threat Level</span>
                      <span>${scorePercent}%</span>
                    </div>
                    <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; position: relative;">
                      <div style="position: absolute; left: 0; top: 0; height: 100%; width: ${scorePercent}%; background: ${scoreColor}; border-radius: 3px; box-shadow: 0 0 10px ${scoreColor};"></div>
                    </div>
                  </div>

                  <div style="margin-top: 16px;">
                    <div class="breach-data-title" style="font-size: 0.85rem; margin-bottom: 8px;">Exposed Data Attributes:</div>
                    <div class="breach-data" style="display: flex; flex-wrap: wrap; gap: 6px;">${dataTags}</div>
                  </div>
               </div>
            </div>`;
        }).join('');
      } else {
        bWrapper.style.display = 'none';
      }
    }

    /* ── Floating Chatbot Logic ──────────────────────────────────────── */
    const chatWidget = document.getElementById('chat-widget');
    const toggleBtn = document.getElementById('chat-toggle-btn');
    const win = document.getElementById('chat-window');

    function toggleChat() {
      chatWidget.classList.toggle('active');
      if (chatWidget.classList.contains('active')) {
        win.scrollTop = win.scrollHeight;
        document.getElementById('chat-input').focus();
      }
    }

    async function sendChat() {
      const inp = document.getElementById('chat-input');
      const q = inp.value.trim();
      if (!q) return;
      inp.value = '';

      // User msg
      appendChat('user', q);

      // Loading thinking
      const thinkId = 'think-' + Date.now();
      appendChat('think', 'Thinking...', thinkId);

      const btn = document.getElementById('btn-chat');
      btn.disabled = true;

      try {
        const resp = await fetch(BASE_URL + '/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: q, context: currentContext }),
        });
        const data = await resp.json();
        const thinkEl = document.getElementById(thinkId);
        if (thinkEl) thinkEl.remove();

        if (resp.ok) {
          appendChat('ai', formatMarkdown(data.reply), null, data.powered_by);
        } else {
          appendChat('ai', '⚠️ Error: ' + (data.detail || 'Unknown error'));
        }
      } catch (err) {
        const thinkEl = document.getElementById(thinkId);
        if (thinkEl) thinkEl.remove();
        appendChat('ai', '⚠️ Cannot reach API. Is the server running?');
      } finally {
        btn.disabled = false;
      }
    }

    function appendChat(role, html, id = null, poweredBy = null) {
      const meta = poweredBy ? `<div class="msg-meta">Powered by ${poweredBy}</div>` : '';
      const msgId = id || `msg-${Date.now()}`;
      win.insertAdjacentHTML('beforeend', `<div id="${msgId}" class="msg ${role}" style="${role === 'ai' && !id ? 'opacity:0' : ''}"></div>`);

      const el = document.getElementById(msgId);
      el.innerHTML = html + meta;

      if (role === 'ai' && !id) {
        playSound('tick');
        let op = 0;
        const fade = setInterval(() => {
          op += 0.1;
          el.style.opacity = op;
          if (op >= 1) clearInterval(fade);
        }, 30);
      }
      win.scrollTop = win.scrollHeight;
    }

    function formatMarkdown(text) {
      return text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,.1);padding:2px 4px;border-radius:4px;font-family:var(--mono);font-size:0.9em">$1</code>')
        .replace(/\n/g, '<br>');
    }

    /* ── Wiki Hub Tabs & Search ───────────────────────────────────────── */
    function openWikiTab(event, id) {
      if(id !== 'wiki-search-results') { initAudio(); playSound('tick'); }
      document.querySelectorAll('.wiki-pane').forEach(p => p.style.display = 'none');
      document.querySelectorAll('.wiki-tab').forEach(t => t.classList.remove('active'));
      document.getElementById(id).style.display = 'block';
      if(event && event.currentTarget && event.currentTarget.classList) {
        event.currentTarget.classList.add('active');
      }
    }

    function searchWiki() {
      const input = document.getElementById('wiki-search-input').value.toLowerCase();
      const tabs = document.querySelectorAll('.wiki-sidebar .wiki-tab');
      let firstMatch = null;
      let hasMatches = false;
      
      tabs.forEach(tab => {
        const text = tab.textContent.toLowerCase();
        // Also check the content of the pane itself
        const paneId = tab.getAttribute('onclick').match(/'([^']+)'/)[1];
        const paneContent = document.getElementById(paneId).textContent.toLowerCase();
        
        if (text.includes(input) || paneContent.includes(input)) {
          tab.style.display = 'block';
          hasMatches = true;
          if (!firstMatch) firstMatch = { elem: tab, id: paneId };
        } else {
          tab.style.display = 'none';
        }
      });

      if (input.trim() === '') {
        // Reset to default active tab if empty
        tabs.forEach(tab => tab.style.display = 'block');
        const defaultTab = tabs[0];
        const defaultId = defaultTab.getAttribute('onclick').match(/'([^']+)'/)[1];
        openWikiTab({ currentTarget: defaultTab }, defaultId);
      } else if (hasMatches && firstMatch) {
        // Open the first matching tab
        openWikiTab({ currentTarget: firstMatch.elem }, firstMatch.id);
      } else {
        // Show no results pane
        document.querySelectorAll('.wiki-pane').forEach(p => p.style.display = 'none');
        document.querySelectorAll('.wiki-tab').forEach(t => t.classList.remove('active'));
        const srPane = document.getElementById('wiki-no-results');
        if(srPane) srPane.style.display = 'block';
      }
    }

    /* ── Firebase Authentication (Placeholders) ──────────────────────── */
    // TODO: Replace with your actual Firebase configuration object
    const firebaseConfig = {
      apiKey: "AIzaSyA3QepZk3P3wdu8Ym7DfljAjJCa90f64aM",
      authDomain: "tracezero-af0dd.firebaseapp.com",
      projectId: "tracezero-af0dd",
      storageBucket: "tracezero-af0dd.firebasestorage.app",
      messagingSenderId: "417548552499",
      appId: "1:417548552499:web:9d6124862a7a726cb65646",
      measurementId: "G-PFXJQ1NJH4"
    };

    // Initialize Firebase only if the placeholder is changed or ignore errors
    let fAuth = null;
    let confirmationResult = null;

    try {
      if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
        firebase.initializeApp(firebaseConfig);
        fAuth = firebase.auth();

        fAuth.onAuthStateChanged((user) => {
          const btn = document.getElementById('auth-btn');
          const display = document.getElementById('user-display');

          if (user) {
            btn.textContent = "Logout";
            btn.onclick = () => { fAuth.signOut(); };
            display.style.display = 'block';
            display.textContent = user.email || user.phoneNumber || 'User';
            closeAuthModal();
          } else {
            btn.textContent = "Login";
            btn.onclick = openAuthModal;
            display.style.display = 'none';
          }
        });
      } else {
        console.warn("Firebase config is using placeholders. Auth will not work until updated.");
      }
    } catch (e) {
      console.error("Firebase init error", e);
    }

    function openAuthModal() {
      initAudio(); playSound('blip');
      if (firebaseConfig.apiKey === "YOUR_API_KEY") {
        alert("Firebase Authentication is not configured. Please add your config in index.html to enable authentication.");
        return;
      }
      document.getElementById('auth-overlay').style.display = 'flex';


    }

    function closeAuthModal() {
      initAudio(); playSound('tick');
      document.getElementById('auth-overlay').style.display = 'none';
      document.getElementById('auth-error').textContent = '';
    }

    async function signInWithGoogle() {
      initAudio(); playSound('blip');
      document.getElementById('auth-error').textContent = '';
      const provider = new firebase.auth.GoogleAuthProvider();
      try {
        await fAuth.signInWithPopup(provider);
      } catch (err) {
        console.error(err);
        document.getElementById('auth-error').textContent = err.message;
      }
    }



    async function signInWithEmail() {
      initAudio(); playSound('blip');
      document.getElementById('auth-error').textContent = '';
      const email = document.getElementById('email-input').value.trim();
      const password = document.getElementById('password-input').value.trim();

      if (!email || !password) {
        document.getElementById('auth-error').textContent = 'Please enter both email and password.';
        return;
      }

      const btn = document.getElementById('btn-email-login');
      btn.disabled = true;
      btn.textContent = 'Logging in...';

      try {
        await fAuth.signInWithEmailAndPassword(email, password);
      } catch (err) {
        console.error(err);
        document.getElementById('auth-error').textContent = err.message;
      } finally {
        btn.disabled = false;
        btn.textContent = 'Login';
      }
    }

    async function signUpWithEmail() {
      initAudio(); playSound('blip');
      document.getElementById('auth-error').textContent = '';
      const email = document.getElementById('email-input').value.trim();
      const password = document.getElementById('password-input').value.trim();

      if (!email || !password) {
        document.getElementById('auth-error').textContent = 'Please enter both email and password.';
        return;
      }

      const btn = document.getElementById('btn-email-signup');
      btn.disabled = true;
      btn.textContent = 'Signing up...';

      try {
        await fAuth.createUserWithEmailAndPassword(email, password);
      } catch (err) {
        console.error(err);
        document.getElementById('auth-error').textContent = err.message;
      } finally {
        btn.disabled = false;
        btn.textContent = 'Sign Up';
      }
    }
    /* ── IntersectionObserver for Staggered Reveal ────────────────────── */
    document.addEventListener("DOMContentLoaded", () => {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      document.querySelectorAll('.staggered-reveal').forEach(el => observer.observe(el));
    });
  