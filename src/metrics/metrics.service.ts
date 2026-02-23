import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class MetricsService {
    constructor(private readonly db: DatabaseService) { }

    async getPreferredUser(userId: number) {
        const result = await this.db.query(
            'SELECT * FROM fun_get_preferred_match_user($1)',
            [userId],
        );
        return result[0] || null;
    }

    async getMatchCountries(userId: number) {
        const result = await this.db.query(
            'SELECT * FROM fun_get_match_countries($1)',
            [userId],
        );
        return result;
    }

    async getChatWordFrequency(userId: number) {
        const result = await this.db.query(
            'SELECT * FROM fun_get_chat_words($1)',
            [userId],
        );
        return result;
    }

    async getNewMatchesCount(userId: number) {
        const result = await this.db.query(
            'SELECT * FROM fun_get_new_matches_count($1)',
            [userId],
        );
        return result[0] || { new_matches: 0 };
    }

    async getAvgInteractionsPerCall(userId: number) {
        const result = await this.db.query(
            'SELECT * FROM fun_get_avg_interactions_per_call($1)',
            [userId],
        );
        return result[0] || { avg_interactions: 0 };
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
