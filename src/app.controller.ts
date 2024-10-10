import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';

/**
 *
 */
@Controller()
export class AppController {
    /**
     *
     * @param {AppService} appService - Service chính
     */
    constructor(private readonly appService: AppService) {}

    /**
     *  @returns {string} - Chuỗi chào
     */
    @Get()
    getHello(): string {
        return this.appService.getHello();
    }
}
