import { Module } from '@nestjs/common';

import { MovieConversationService } from '@modules/telegram/movie-conversation.service';
import { TelegramService } from '@modules/telegram/telegram.service';

/**
 *
 */
@Module({
    providers: [TelegramService, MovieConversationService],
    exports: [TelegramService],
})
export class TelegramModule {}
