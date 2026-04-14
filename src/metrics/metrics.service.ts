import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class MetricsService {
    constructor(private readonly db: DatabaseService) { }

    async getPreferredUser(userId: number) {
        const result = await this.db.query(
            'SELECT id_user, first_name, last_name, profile_photo, interaction_count FROM fun_get_preferred_match_user($1)',
            [userId],
        );
        return result[0] || null;
    }

    async getMatchCountries(userId: number) {
        const result = await this.db.query(
            'SELECT country_name, match_count FROM fun_get_match_countries($1)',
            [userId],
        );
        return result;
    }

    async getChatWordFrequency(userId: number) {
        const result = await this.db.query(
            'SELECT word, frequency FROM fun_get_chat_words($1)',
            [userId],
        );
        return result;
    }

    async getNewMatchesCount(userId: number) {
        const result = await this.db.query(
            'SELECT new_matches FROM fun_get_new_matches_count($1)',
            [userId],
        );
        return result[0] || { new_matches: 0 };
    }

    async getAvgInteractionsPerCall(userId: number) {
        try {
            // Evaluando cuantos mensajes se envían (total)
            const msgs = await this.db.query(
                'SELECT COUNT(*)::int as total FROM chat_logs WHERE sender_id = $1',
                [userId]
            );

            // Evaluando cuantas llamadas (sesiones) tiene el usuario
            const sessions = await this.db.query(
                'SELECT COUNT(*)::int as total FROM sessions WHERE id_user1 = $1 OR id_user2 = $1',
                [userId]
            );

            const totalMsgs = msgs[0]?.total || 0;
            const totalSessions = sessions[0]?.total || 0;

            const avg = totalSessions > 0 ? (totalMsgs / totalSessions) : totalMsgs;

            return { avg_interactions: avg };
        } catch (error) {
            console.error("Error calculando el promedio de mensajes:", error);
            return { avg_interactions: 0 };
        }
    }

    async getAllMetrics(userId: number) {
        const [
            preferredUser,
            matchCountries,
            chatWords,
            newMatches,
            avgInteractions,
        ] = await Promise.all([
            this.getPreferredUser(userId),
            this.getMatchCountries(userId),
            this.getChatWordFrequency(userId),
            this.getNewMatchesCount(userId),
            this.getAvgInteractionsPerCall(userId),
        ]);

        return {
            preferredUser,
            matchCountries,
            chatWords,
            newMatches: newMatches?.new_matches ?? 0,
            avgInteractionsPerCall: avgInteractions?.avg_interactions ?? 0,
        };
    }
}
