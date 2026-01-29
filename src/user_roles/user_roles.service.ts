
import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { UserRole } from './DTO/user-role.dto';

@Injectable()
export class UserRolesService {
    constructor(private readonly db: DatabaseService) { }

    async getAll(): Promise<UserRole[]> {
        // Using direct query as stored procedure availability is unverified for this new module
        // and we want to ensure functionality.
        return this.db.query<UserRole>('SELECT role_code, role_name, description FROM user_roles ORDER BY role_name ASC');
    }
}
