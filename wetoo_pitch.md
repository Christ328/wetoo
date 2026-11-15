---
marp: true
theme: default
paginate: true
style: |
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap');

  * { box-sizing: border-box; }

  section {
    font-family: 'Inter', sans-serif;
    background: #ffffff;
    color: #1e293b;
    padding: 48px 60px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  h1 { font-size: 2.3em; font-weight: 800; color: #6C3FE8; margin: 0 0 10px 0; line-height: 1.15; }
  h2 { font-size: 1.6em; font-weight: 700; color: #6C3FE8; margin: 0 0 22px 0; }
  h3 { font-size: 1em; font-weight: 700; color: #6C3FE8; margin: 0 0 5px 0; }
  p, li { font-size: 0.88em; line-height: 1.6; color: #334155; }
  ul { padding-left: 1.2em; margin: 0; }
  li { margin-bottom: 6px; }
  strong { color: #6C3FE8; font-weight: 700; }
  blockquote { border: none; margin: 0 0 16px 0; padding: 0; }
  blockquote p { font-size: 0.95em; color: #334155; }

  .pill {
    display: inline-block;
    background: #EDE9FF;
    color: #6C3FE8;
    border-radius: 999px;
    padding: 3px 13px;
    font-size: 0.75em;
    font-weight: 600;
    margin-right: 5px;
    margin-bottom: 4px;
  }
  .tag-row { margin-bottom: 18px; }

  .card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .card { background: rgba(255,255,255,0.88); border-radius: 12px; padding: 16px 18px; }
  .card h3 { margin-bottom: 4px; font-size: 0.95em; }
  .card p  { margin: 0; font-size: 0.83em; }

  .stat-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 14px; }
  .stat { background: rgba(255,255,255,0.88); border-radius: 12px; padding: 16px 12px; text-align: center; }
  .stat .num { font-size: 1.9em; font-weight: 800; color: #6C3FE8; display: block; line-height: 1.1; }
  .stat .lbl { font-size: 0.74em; color: #64748b; margin-top: 3px; display: block; }

  .budget-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 8px; }
  .bitem { background: #F8F6FF; border-radius: 12px; padding: 16px 12px; text-align: center; }
  .bitem .pct { font-size: 1.8em; font-weight: 800; color: #6C3FE8; display: block; }
  .bitem .blab { font-size: 0.75em; color: #475569; margin-top: 5px; display: block; line-height: 1.4; }

  .team-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-top: 8px; }
  .member { background: #F8F6FF; border-radius: 12px; padding: 16px 10px; text-align: center; }
  .member img { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; margin: 0 auto 10px; display: block; border: 3px solid #EDE9FF; }
  .member .mname { font-weight: 700; font-size: 0.8em; color: #1e293b; margin-bottom: 4px; }
  .member .mrole { font-size: 0.72em; color: #6C3FE8; line-height: 1.4; }

  section.cover {
    background: linear-gradient(135deg, #6C3FE8 0%, #9B6DFF 55%, #C084FC 100%);
    color: white;
    justify-content: center;
    align-items: flex-start;
  }
  section.cover h1 { color: white; font-size: 3em; margin-bottom: 8px; }
  section.cover .sub { font-size: 1em; color: rgba(255,255,255,0.85); margin-bottom: 32px; font-weight: 400; }
  section.cover .badge { background: rgba(255,255,255,0.18); color: white; border-radius: 999px; padding: 5px 16px; font-size: 0.8em; font-weight: 600; display: inline-block; margin-right: 7px; }
  section.cover .tagline { font-size: 1.1em; color: rgba(255,255,255,0.95); margin-top: 26px; font-style: italic; font-weight: 300; }

  section.bg-problem {
    background-image: url('bg_problem.svg');
    background-size: cover;
    background-position: center;
  }

  section.bg-solution {
    background-image: url('bg_solution.svg');
    background-size: cover;
    background-position: center;
  }

  section.merci {
    background: linear-gradient(135deg, #6C3FE8 0%, #9B6DFF 55%, #C084FC 100%);
    color: white;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
  section.merci h1 { color: white; font-size: 3.6em; margin-bottom: 10px; }
  section.merci p  { color: rgba(255,255,255,0.88); font-size: 1.05em; }
  section.merci .url { margin-top: 24px; background: rgba(255,255,255,0.18); color: white; border-radius: 10px; padding: 10px 26px; font-size: 0.92em; font-weight: 600; display: inline-block; }

  section::after { font-size: 0.7em; color: #94a3b8; }
---

<!-- _class: cover -->

# WeToo 💜

<p class="sub">Inclusive community platform for sexual health<br>and well-being for all young people</p>

<div>
  <span class="badge">YTH Live Global 2026</span>
  <span class="badge">Team Era Nova</span>
</div>

<p class="tagline">"Because every young person deserves reliable information, without judgment."</p>

---

<!-- _class: bg-problem -->

## 🔍 The Problem

<div class="tag-row">
  <span class="pill">Benin</span>
  <span class="pill">Youth aged 13-29</span>
  <span class="pill">Dual crisis</span>
</div>

<div class="card-grid">
  <div class="card"><h3>🚫 Culture of Taboo</h3><p>Sexual education is absent from schools and rarely discussed at home.</p></div>
  <div class="card"><h3>📣 Fake News Infodemic</h3><p>Young people rely on rumors about sexuality, leading to dangerous behaviors and deep-seated fears.</p></div>
  <div class="card"><h3>🧠 Mental Health Link</h3><p>The stigma and fear surrounding sexual health directly fuel anxiety, depression and isolation.</p></div>
  <div class="card"><h3>🔒 No Safe Space</h3><p>Existing digital tools are expensive, text-heavy, and implicitly exclude boys from the conversation.</p></div>
</div>

<div class="stat-row">
  <div class="stat"><span class="num">1/3</span><span class="lbl">teenage girls in Benin affected by early pregnancy</span></div>
  <div class="stat"><span class="num">72%</span><span class="lbl">of youth have no reliable source of sexual health information</span></div>
  <div class="stat"><span class="num">1/7</span><span class="lbl">young people globally live with a mental health disorder</span></div>
</div>

---

<!-- _class: bg-solution -->

## 💡 The Solution: WeToo

<div class="tag-row">
  <span class="pill">Inclusive girls and boys</span>
  <span class="pill">Low connectivity</span>
  <span class="pill">Web · WhatsApp · USSD/SMS</span>
</div>

> **WeToo** is an inclusive, community-driven digital ecosystem combining sexual and mental health education for **all** youth, judgment-free, accessible even without a high-end smartphone.

<div class="card-grid" style="margin-top:16px;">
  <div class="card"><h3>🤖 Anti-Fake News Chatbot</h3><p>AI trained to answer sensitive questions 24/7, debunk myths and explain the link between sexual health and mental well-being.</p></div>
  <div class="card"><h3>🎮 Gamified Learning</h3><p>Mini-courses, quizzes and puzzles. Points, badges, leaderboards and digital certificates to make learning engaging.</p></div>
  <div class="card"><h3>💬 Community and Expert Space</h3><p>Moderated forum and confidential direct messaging with partnered health professionals (nurse, psychologist, midwife).</p></div>
  <div class="card"><h3>📱 WhatsApp and Monthly Campaigns</h3><p>Expert-led WhatsApp community, complemented by a nationwide thematic awareness campaign every month.</p></div>
</div>

---

## 🧠 Designed with Youth

<div class="tag-row">
  <span class="pill">Youth-led design</span>
  <span class="pill">Focus groups Benin</span>
</div>

<div class="card-grid">
  <div class="card"><h3>👦 Boys felt excluded</h3><p>Focus groups revealed that boys felt left out of reproductive health conversations. WeToo is designed for both genders.</p></div>
  <div class="card"><h3>👧 Fear of being judged</h3><p>Girls expressed a deep fear of being judged by adults. Anonymity and confidentiality are at the core of WeToo.</p></div>
  <div class="card"><h3>🎯 Gamification was requested</h3><p>Young people explicitly asked for quizzes and points because traditional lectures felt too much like school.</p></div>
  <div class="card"><h3>🔐 Anonymous peer chat</h3><p>They highlighted the need to talk anonymously with peers before seeing a doctor. The forum provides this space.</p></div>
</div>

---

## ✨ What Makes Us Different

<div class="card-grid">
  <div class="card"><h3>🔗 Holistic Health</h3><p>One of the few platforms addressing <strong>sexual health and mental well-being</strong> as interconnected issues, not separate ones.</p></div>
  <div class="card"><h3>⚧ 100% Inclusive</h3><p>Actively designed for both girls and boys, breaking the stereotype that sexual health is only a "girl's issue."</p></div>
  <div class="card"><h3>🤝 Human-AI Hybrid</h3><p>The 24/7 availability of a chatbot combined with the empathy and expertise of real partnered health professionals.</p></div>
  <div class="card"><h3>📶 Frugal Tech</h3><p>Built for low bandwidth. WhatsApp and USSD/SMS fallback for areas without internet. <strong>No youth is left behind.</strong></p></div>
</div>

---

## 🛠️ Technical Architecture

<div class="tag-row">
  <span class="pill">React + Vite</span>
  <span class="pill">Node.js / Express</span>
  <span class="pill">Supabase (PostgreSQL)</span>
  <span class="pill">Vercel</span>
</div>

<div class="card-grid">
  <div class="card"><h3>🖥️ Frontend</h3><p><strong>React + Vite</strong> - Lightweight, responsive, PWA-ready web app. Optimized for slow connections. Deployed on Vercel.</p></div>
  <div class="card"><h3>⚙️ Backend</h3><p><strong>Express.js</strong> - Secured REST API with JWT and Supabase RLS. Handles anonymity, auto-moderation and gamification logic.</p></div>
  <div class="card"><h3>🗄️ Database</h3><p><strong>Supabase (PostgreSQL)</strong> - 18 tables, RLS enabled. Data accessible only via server-side service_role key.</p></div>
  <div class="card"><h3>🤖 AI Chatbot</h3><p>Response engine trained on a validated medical corpus. Fake-news debunker, crisis detection and referral to helpline 137.</p></div>
</div>

<p style="margin-top:18px; text-align:center; font-size:0.82em; color:#6C3FE8; font-weight:700;">🌐 wetoo-five.vercel.app</p>

---

## 💰 How We Will Use the Funding

<div class="tag-row"><span class="pill">$5,000 grant</span><span class="pill">Functional pilot</span></div>

<div class="budget-row">
  <div class="bitem"><span class="pct">40%</span><span class="blab">🖥️ MVP Development<br>Web app · AI chatbot · USSD/SMS fallback</span></div>
  <div class="bitem"><span class="pct">30%</span><span class="blab">👩‍⚕️ Expert Network and Moderation<br>Partnered health professionals · Peer moderators</span></div>
  <div class="bitem"><span class="pct">20%</span><span class="blab">🎮 Gamification and Content<br>Courses · Quizzes · Translation into Fon, Yoruba, Bariba, Dendi</span></div>
  <div class="bitem"><span class="pct">10%</span><span class="blab">📣 Launch Campaign<br>First monthly campaign · WhatsApp community activation</span></div>
</div>

<div class="card" style="margin-top:18px; background:#F0EBFF;">
  <p style="margin:0; font-size:0.85em; text-align:center;">🎯 <strong>Pilot target:</strong> 500 active youth · 10 partner experts · 4 national campaigns · 2 local languages within 6 months of funding.</p>
</div>

---

## 👥 Team Era Nova

<div class="team-grid">
  <div class="member">
    <img src="image1.jpeg" alt="BOCO Daniel"/>
    <div class="mname">BOCO Daniel</div>
    <div class="mrole">Project Lead and AI Strategy<br>Data architecture and Medical validation of the chatbot</div>
  </div>
  <div class="member">
    <img src="image2.jpeg" alt="DJOMAMOU Prince"/>
    <div class="mname">DJOMAMOU Prince</div>
    <div class="mrole">Modelling and Simulation<br>User behaviour analysis and System optimization</div>
  </div>
  <div class="member">
    <img src="image3.jpeg" alt="DOHOU Alexis"/>
    <div class="mname">DOHOU Alexis</div>
    <div class="mrole">Data and User Research<br>Youth needs analysis · Pedagogical content and Gamification</div>
  </div>
  <div class="member">
    <img src="image4.jpg" alt="GANGNEHESSOU Christanel"/>
    <div class="mname">GANGNEHESSOU Christanel</div>
    <div class="mrole">Full-Stack Web Developer<br>UI/UX Design · React · Express · Deployment</div>
  </div>
</div>

---

## 🎬 A Note on Our Demo Video

<div class="card" style="background: #FFF7ED; padding: 32px 40px; text-align: center; margin-top: 16px;">
  <p style="font-size: 1em; color: #92400E; margin: 0 0 16px 0; font-weight: 700;">
    ⚠️ Important note to the jury
  </p>
  <p style="margin: 0; font-size: 0.92em; color: #78350F; line-height: 1.9;">
    We had fully prepared and finalized a demo video for WeToo.<br>
    A few minutes before the submission deadline, the sharing link stopped working and kept returning errors.<br><br>
    We sincerely apologize for this technical issue, which was entirely beyond our control.<br><br>
    <strong>We therefore submitted a written document presenting our project in full detail</strong>,<br>
    which covers all aspects of the platform, its features and its impact.
  </p>
</div>

---

<!-- _class: merci -->

# Thank You 💜

<p>WeToo - Because every young person deserves a safe space.</p>

<div class="url">🌐 wetoo-five.vercel.app</div>

<p style="margin-top:20px; font-size:0.85em; opacity:0.75;">Team Era Nova · YTH Live Global Innovation Challenge 2026</p>
