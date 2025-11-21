export type UserValidation = {
    id_user: Number;
    first_name:  string;
    last_name: string;
    email:string;
    password_hash: string;
    gender_id: Number;
    birth_date: string;
    country_id: string;
    profile_photo: string;
    native_lang_id: string;
    target_lang_id: string;
    match_quantity: Number;
    bank_id: string;
    role_code:string;
    description:Text;
    is_active: Boolean;
    email_verified: Boolean;
    last_login: string;
    created_at: string;
    updated_at:String;
}