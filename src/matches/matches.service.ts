import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { createLikeDto } from './DTO/create-like.dto';

@Injectable()
export class MatchesService {
    constructor(private readonly db:DatabaseService) {

    }

async createLike(like: createLikeDto): Promise<string> {
  try {
    const result = await this.db.query(
      'SELECT add_user_like($1, $2) AS message',
      [like.user_1, like.user_2]
    );


    return result[0].message;
  } catch (error) {

    throw new BadRequestException('Error creating like.');
  }
}

}
