export type User = {
    id_user: Number;
    first_name: String;
    last_name: String;
    email: String;
    gender_id: Number;
    birth_date: String;
    country_id: String;
    profile_photo: String;
    native_lang_id: String;
    target_lang_id: String;
    match_quantity: Number;
    bank_id: String;
    role_code: String;
    description: Text;
    is_active: boolean | string | number;  // Puede venir como boolean, 't'/'f', o 0/1 desde PostgreSQL
    email_verified: boolean;
    last_login: String;
    created_at: String;
    updated_at: String;
}