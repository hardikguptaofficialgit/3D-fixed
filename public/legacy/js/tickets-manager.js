// ═══════════════════════════════════════════════════════════
// KLYPERIX — TICKET MANAGEMENT SYSTEM
// ═══════════════════════════════════════════════════════════

class TicketsManager {
    constructor(supabaseClient) {
        this.sb = supabaseClient;
        this.currentTickets = [];
    }

    async createTicket(subject, description, priority = 'standard') {
        if (!window.klyperixUser || !window.klyperixUser.loggedIn) {
            throw new Error('Authentication required to create a ticket.');
        }

        const { data, error } = await this.sb.from('tickets').insert({
            user_id: (await this.sb.auth.getUser()).data.user?.id,
            user_email: window.klyperixUser.email,
            user_name: window.klyperixUser.name,
            subject: subject,
            description: description,
            priority: priority
        }).select();

        if (error) throw error;
        return data[0];
    }

    async loadUserTickets() {
        if (!window.klyperixUser || !window.klyperixUser.loggedIn) return [];

        const { data, error } = await this.sb.from('tickets')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[Tickets] Error loading:', error);
            return [];
        }
        this.currentTickets = data;
        return data;
    }

    async loadTicketMessages(ticketId) {
        const { data, error } = await this.sb.from('ticket_messages')
            .select('*')
            .eq('ticket_id', ticketId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    }

    async sendMessage(ticketId, message) {
        const { data, error } = await this.sb.from('ticket_messages').insert({
            ticket_id: ticketId,
            sender_name: window.klyperixUser.name,
            sender_email: window.klyperixUser.email,
            message: message,
            is_admin_reply: false
        }).select();

        if (error) throw error;
        return data[0];
    }

    subscribeToTicket(ticketId, onMessage) {
        return this.sb.channel('ticket-' + ticketId).on('postgres_changes', {
            event: 'INSERT', schema: 'public', table: 'ticket_messages',
            filter: 'ticket_id=eq.' + ticketId
        }, payload => {
            onMessage(payload.new);
        }).subscribe();
    }
}

// Global initialization
window.initTickets = function(sb) {
    window.ticketsManager = new TicketsManager(sb);
    console.log("Klyperix Ticket System: INITIALIZED");
};
