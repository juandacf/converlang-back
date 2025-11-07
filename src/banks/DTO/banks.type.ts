// Para usuarios normales
export class Bank {
    bank_code: string;
    bank_name: string;
}

// Para administradores
export class BankAdminDto extends Bank {
    country_id: string;
    created_at: Date;
    updated_at: Date;
}