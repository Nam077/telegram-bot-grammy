import { Injectable } from '@nestjs/common';

import { InlineKeyboard } from 'grammy';

import { BaseConversationService } from './base-conversation.service';
import { MyContext, MyConversation } from './telegram.service';

export enum ConversationState {
    ASK_NAME = 'ASK_NAME',
    ASK_AGE = 'ASK_AGE',
    ASK_SEX = 'ASK_SEX',
    CONFIRM = 'CONFIRM',
    FALLBACK = 'FALLBACK',
    DONE = 'DONE',
}

/**
 *
 */
@Injectable()
export class MovieConversationService extends BaseConversationService<ConversationState> {
    /**
     *
     * @param {MyConversation} conversation - Cuộc hội thoại hiện tại
     * @param {MyContext} ctx - Context của bot
     */
    async startConversation(conversation: MyConversation, ctx: MyContext) {
        const stateHandlers: Record<
            ConversationState,
            (conversation: MyConversation, ctx: MyContext) => Promise<ConversationState | void>
        > = {
            [ConversationState.ASK_NAME]: this.askForName.bind(this),
            [ConversationState.ASK_AGE]: this.askForAge.bind(this),
            [ConversationState.ASK_SEX]: this.askForSex.bind(this),
            [ConversationState.CONFIRM]: this.confirmName.bind(this),
            [ConversationState.FALLBACK]: this.fallback.bind(this),
            /**
             *
             */
            [ConversationState.DONE]: async () => {},
        };

        await this.runConversation(conversation, ctx, stateHandlers, ConversationState.ASK_NAME);
    }

    /**
     *
     * @param {MyConversation} conversation - Cuộc hội thoại hiện tại
     * @param {MyContext} ctx - Context của bot
     * @returns {Promise<ConversationState>} - Trạng thái tiếp theo
     */
    async askForName(conversation: MyConversation, ctx: MyContext): Promise<ConversationState> {
        await ctx.reply('Please enter your name:');
        const nameCtx = await conversation.waitFor('message:text');

        ctx.session.userName = nameCtx.message.text;

        return ConversationState.ASK_AGE;
    }

    /**
     *
     * @param {MyConversation} conversation - Cuộc hội thoại hiện tại
     * @param {MyContext} ctx - Context của bot
     * @returns {Promise<ConversationState>} - Trạng thái tiếp theo
     */
    async askForAge(conversation: MyConversation, ctx: MyContext): Promise<ConversationState> {
        await ctx.reply('Please enter your age:');
        ctx.session.userAge = await conversation.form.number();

        return ConversationState.ASK_SEX;
    }

    /**
     *
     * @param {MyConversation} conversation - Cuộc hội thoại hiện tại
     * @param {MyContext} ctx - Context của bot
     * @returns {Promise<ConversationState>} - Trạng thái tiếp theo
     */
    async askForSex(conversation: MyConversation, ctx: MyContext): Promise<ConversationState> {
        const label = [
            {
                label: 'male',
                value: 'male',
            },
            {
                label: 'female',
                value: 'female',
            },
        ];

        const buttonRow = label.map((item) => {
            return InlineKeyboard.text(item.label, item.value);
        });

        const keyboard = InlineKeyboard.from([buttonRow]);

        const message = await ctx.reply('Please select sex:', {
            reply_markup: keyboard,
        });

        const sexCtx = await conversation.waitFor('callback_query:data');

        await ctx.api.deleteMessage(ctx.chat.id, message.message_id);
        ctx.session.userSex = sexCtx.callbackQuery.data;

        return ConversationState.CONFIRM;
    }

    /**
     *
     * @param {MyConversation} conversation - Cuộc hội thoại hiện tại
     * @param {MyContext} ctx - Context của bot
     * @returns {Promise<ConversationState>} - Trạng thái tiếp theo
     */
    async confirmName(conversation: MyConversation, ctx: MyContext): Promise<ConversationState> {
        await ctx.reply(
            `Your name is ${ctx.session.userName} your age is ${ctx.session.userAge} and sex is ${ctx.session.userSex}`,
        );

        return ConversationState.DONE;
    }

    /**
     *
     * @param {MyConversation} conversation - Cuộc hội thoại hiện tại
     * @param {MyContext} ctx - Context của bot
     * @returns {Promise<ConversationState>} - Trạng thái tiếp theo
     */
    async fallback(conversation: MyConversation, ctx: MyContext): Promise<ConversationState> {
        await ctx.reply('Sorry, I didn’t understand that. Please try again.');

        return ConversationState.ASK_NAME;
    }
}
