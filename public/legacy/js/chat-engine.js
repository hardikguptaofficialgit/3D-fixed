/**
 * Chat Support Engine for Klyperix
 * Handles visitor registration, intelligent responses, and realtime messaging.
 * Updated with Support Ticket integration and conversation completion logic.
 */
(function() {
    // ── Log page view ──
    if (window.sb) {
        window.sb.from('activity_log').insert({ event_type: 'page_view', event_detail: document.title }).then(() => {});
    }

    const inputRow = document.querySelector('.klchat-input-area');
    const msgsContainer = document.getElementById('klchatMsgs');
    const ticketSection = document.getElementById('klchatTicketSection');
    let isTyping = false;

    function addBubble(text, type, time) {
        if (!msgsContainer) return;
        const d = document.createElement('div');
        d.className = 'klchat-bubble ' + type;
        d.innerHTML = text + (time ? '<div class="btime">' + time + '</div>' : '');
        msgsContainer.appendChild(d);
        msgsContainer.scrollTop = msgsContainer.scrollHeight;
    }

    function showTypingThenReply(text, delay) {
        if (isTyping || !msgsContainer) return;
        isTyping = true;
        const typing = document.createElement('div');
        typing.className = 'klchat-bubble bot';
        typing.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
        msgsContainer.appendChild(typing);
        msgsContainer.scrollTop = msgsContainer.scrollHeight;
        setTimeout(() => {
            if (msgsContainer.contains(typing)) msgsContainer.removeChild(typing);
            addBubble(text, 'bot', new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            isTyping = false;
        }, delay || 1200);
    }

    // ══════════════════════════════════════════════════════════
    // INTELLIGENT RESPONSE ENGINE
    // ══════════════════════════════════════════════════════════
    async function getGroqReply(userMsg) {
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    sessionId: window.klypSessionId || '',
                    page: window.location.pathname
                })
            });
            const json = await res.json().catch(() => null);
            if (!res.ok || !json || !json.ok || !json.reply) throw new Error(json && json.error ? json.error : 'Groq error');
            return String(json.reply);
        } catch (e) {
            console.warn('[Chat] Groq reply failed, using fallback:', e && e.message ? e.message : e);
            return null;
        }
    }

    function getSmartReply(userMsg) {
        const msg = userMsg.toLowerCase().trim();

        if (/^(hi|hello|hey|sup|yo|good\s*(morning|evening|afternoon|night)|howdy|hola|namaste)/i.test(msg)) {
            return `Hello! I'm the Klyperix production node. How can I assist you today?`;
        }

        if (msg.includes('service') || msg.includes('what do you') || msg.includes('offer')) {
            return `We specialize in Video Editing, 3D Animation, and Motion Graphics. Our pipeline is optimized for high-end cinematic impact.`;
        }

        if (msg.includes('ticket') || msg.includes('contact') || msg.includes('human') || msg.includes('owner')) {
            revealTicketOption();
            return `I've enabled the direct contact module for you. You can now create a formal support ticket to speak with the owner.`;
        }

        // Default
        return `Interesting. Tell me more about your vision for this project. The more context you provide, the better I can prepare the production intelligence.`;
    }

    function revealTicketOption() {
        if (ticketSection) {
            ticketSection.classList.add('active');
            if (inputRow) inputRow.style.display = 'none'; // Hide normal input once conversation is "done"
            msgsContainer.scrollTop = msgsContainer.scrollHeight;
        }
    }

    // ── Initialization ──
    function initChat() {
        const sendBtn = document.getElementById('klchatSend');
        if (sendBtn) sendBtn.addEventListener('click', sendUserMsg);

        const msgInput = document.getElementById('klchatMsg');
        if (msgInput) msgInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendUserMsg(); });

        const ticketBtn = document.getElementById('createTicketChatBtn');
        if (ticketBtn) ticketBtn.addEventListener('click', handleCreateTicket);

        const closeBtn = document.getElementById('klchatClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                document.getElementById('klypChatPanel').classList.remove('visible');
                document.getElementById('klypChatBtn').classList.remove('open');
            });
        }

        const chatBtn = document.getElementById('klypChatBtn');
        if (chatBtn) {
            chatBtn.addEventListener('click', () => {
                document.getElementById('klypChatPanel').classList.add('visible');
                chatBtn.classList.add('open');
            });
        }

        // Always show greeting for anonymous users
        showGreeting();
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
    }

    function showGreeting() {
        addBubble(`Klyperix Assistant Online. How can I assist you in your production journey today?`, 'bot');
    }

    async function sendUserMsg() {
        const input = document.getElementById('klchatMsg');
        const msg = input.value.trim();
        if (!msg) return;
        input.value = '';

        addBubble(msg, 'user', new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

        // Prefer Groq (Next.js server route). Fall back to rule-based replies.
        const groqReply = await getGroqReply(msg);
        const reply = groqReply || getSmartReply(msg);
        showTypingThenReply(reply, groqReply ? 900 : 1000);
    }

    async function handleCreateTicket() {
        if (!window.ticketsManager) {
            alert('Ticket system initializing...');
            return;
        }

        try {
            const subject = `New Inquiry via Chat`;
            const description = `A visitor has requested direct production contact via the AI Assistant.`;
            await window.ticketsManager.createTicket(subject, description, 'standard');
            
            // Success UI
            ticketSection.innerHTML = `
                <div class="tk-header" style="color:#57C16F">✔ Ticket Transmitted</div>
                <p style="font-size: 11px; opacity: 0.7; margin: 4px 0 12px;">Your inquiry has been logged in our secure vault. The owner will review your session and reach out shortly.</p>
            `;
        } catch (err) {
            console.error('[Chat] Ticket Error:', err);
            window.location.href = "mailto:garvagarwal03@gmail.com";
        }
    }


    document.addEventListener('DOMContentLoaded', initChat);
})();
