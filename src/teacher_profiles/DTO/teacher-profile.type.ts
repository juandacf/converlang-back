export type TeacherProfile = {
    user_id: number;
    teaching_language_id: string;
    lang_certification?: string;
    academic_title?: string;
    experience_certification?: string;
    hourly_rate?: number;
    specialization?: string;
    years_experience?: number;
    availability_notes?: string;
    is_verified: boolean;
    verified_at?: Date;
    verified_by?: number;
    created_at: Date;
    updated_at: Date;
}