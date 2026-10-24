/*
 * chatbot-click-voice.js
 *
 * Source for the chatbot "click -> voice greeting" hook used on the Horizon site.
 *
 * IMPORTANT
 * - This is a WEBSITE behaviour, not a Claude Code hook. Claude Code hooks run on Claude Code
 *   events (tool calls, prompts, stop) and cannot react to a visitor clicking the page.
 * - The live copy is inlined in index.html (search for "Chat widget"). The page's Content Security
 *   Policy only allows that one inline script, by hash, so this file is not loaded by the page.
 *   If you change the greeting or behaviour here, mirror it in index.html and re-run the CSP re-hash
 *   snippet from SECURITY.md.
 *
 * Expected markup (see index.html): #chat-fab, #chat-card, #chat-msg, #chat-replay, #chat-close, #chat-hint
 */
(function () {
  'use strict';

  var GREETING = 'Hello, so nice to visit us! How can I help you with your financial planning?';
  var WHATSAPP = 'https://wa.me/6512345678';

  var hasVoice = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

  function pickVoice() {
    var voices = window.speechSynthesis.getVoices() || [];
    var english = voices.filter(function (v) { return /^en/i.test(v.lang); });
    var friendly = english.filter(function (v) { return /female|samantha|zira|aria|jenny|karen|moira|susan/i.test(v.name); });
    return friendly[0] || english[0] || null;
  }

  // Browsers only allow speech after a user gesture, so call this from a click handler.
  function speakGreeting(onStart, onEnd) {
    if (!hasVoice) return;
    try {
      window.speechSynthesis.cancel();
      setTimeout(function () {
        var u = new SpeechSynthesisUtterance(GREETING);
        var v = pickVoice();
        u.lang = v ? v.lang : 'en-US';
        if (v) u.voice = v;
        u.rate = 1;
        u.pitch = 1.15; // slightly higher = cuter
        u.onstart = onStart || null;
        u.onend = u.onerror = onEnd || null;
        window.speechSynthesis.speak(u);
      }, 60);
    } catch (e) { /* voice unavailable: the text greeting still shows */ }
  }

  window.HorizonChatVoice = { greeting: GREETING, whatsapp: WHATSAPP, speak: speakGreeting };
})();
