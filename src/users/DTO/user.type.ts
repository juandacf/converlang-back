export type User = {
    id_user: number;
    first_name: string;
    last_name: string;
    email: string;
    gender_id: number;
    birth_date: string;
    country_id: string;
    profile_photo: string;
    native_lang_id: string;
    target_lang_id: string;
    match_quantity: number;

    role_code: string;
    description: string;
    is_active: boolean | string | number;  // Puede venir como boolean, 't'/'f', o 0/1 desde PostgreSQL
    email_verified: boolean;
    last_login: string;
    created_at: string;
    updated_at: string;
}