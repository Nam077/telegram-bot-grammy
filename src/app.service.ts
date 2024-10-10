import { Injectable } from '@nestjs/common';

/**
 *
 */
@Injectable()
export class AppService {
    /**
     * @name getHello
     * @description - Returns a string
     * @returns {string} - Hello World!
     */
    getHello(): string {
        return 'Hello World!';
    }
}
