// src/users/DTO/users.type.ts

export interface User {
    id_user: number;
    first_name: string;
    last_name: string;
    email: string;
    password_hash: string;
    gender_id?: number;
    birth_date: Date;
    country_id: string;
    profile_photo?: string;
    native_lang_id: string;
    target_lang_id: string;
    match_quantity: number;
    bank_id?: string;
    role_code?: string;
    description: string;
    is_active: boolean;
    email_verified: boolean;
    last_login: Date;
    created_at: Date;
    updated_at: Date;
}

// Tipo para respuestas públicas (sin datos sensibles)
export interface PublicUser {
    id_user: number;
    first_name: string;
    last_name: string;
    email: string;
    gender_id?: number;
    birth_date: Date;
    country_id: string;
    profile_photo?: string;
    native_lang_id: string;
    target_lang_id: string;
    description: string;
    is_active: boolean;
    email_verified: boolean;
    role_code?: string;
    created_at: Date;
}