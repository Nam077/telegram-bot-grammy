import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { type Conversation, type ConversationFlavor, conversations, createConversation } from '@grammyjs/conversations';
import { Bot, Context, session, SessionFlavor } from 'grammy';

import { MovieConversationService } from '@modules/telegram/movie-conversation.service';

export type MyContext = Context & ConversationFlavor & SessionFlavor<any>;
export type MyConversation = Conversation<MyContext>;

/**
 *
 */
@Injectable()
export class TelegramService implements OnModuleInit {
    private bot: Bot<MyContext>;

    /**
     *
     * @param {ConfigService} configService - Service cấu hình
     * @param {MovieConversationService} movieConversationService - Service quản lý hội thoại với phim
     */
    constructor(
        private readonly configService: ConfigService,
        private movieConversationService: MovieConversationService,
    ) {}

    /**
     *
     * @param {MyContext} ctx - Context của bot
     * @returns {Promise<boolean>} - Kết quả kiểm tra
     */
    isMemberOfChat = async (ctx: MyContext): Promise<boolean> => {
        const chatMember = await ctx.getChatMember(ctx.from.id);

        return (
            chatMember.status === 'member' || chatMember.status === 'administrator' || chatMember.status === 'creator'
        );
    };

    /**
     *
     */
    async onModuleInit() {
        const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');

        this.bot = new Bot<MyContext>(botToken);

        this.bot.use(
            session({
                /**
                 * Hàm khởi tạo giá trị cho session
                 * @returns {Record<string, any>} - Giá trị khởi tạo
                 */
                initial: (): Record<string, any> => ({
                    userName: '',
                    userAge: '',
                }),
            }),
        );
        this.bot.use(conversations());

        // Sử dụng conversation đã định nghĩa
        this.bot.use(
            createConversation(this.movieConversationService.startConversation.bind(this.movieConversationService), {
                id: 'movie-conversation',
            }),
        );

        this.bot.command('start', async (ctx) => {
            if (await this.isMemberOfChat(ctx)) {
                await ctx.reply('You must be a member of the chat to start the conversation.');

                return;
            }

            await ctx.conversation.enter('movie-conversation');
        });

        this.bot.command('cancel', async (ctx) => {
            await ctx.conversation.exit();
            await ctx.reply('You have canceled the conversation.');
        });

        this.bot.on('chat_member', async (ctx: MyContext) => {
            const memberStatus = ctx.update.chat_member;

            if (memberStatus.new_chat_member.status === 'member') {
                console.log(memberStatus.new_chat_member);
                await ctx.reply(`${memberStatus.new_chat_member.user.first_name} vừa tham gia nhóm.`);
            }

            if (memberStatus.new_chat_member.status === 'left') {
                console.log(memberStatus.new_chat_member);
                await ctx.reply(`${memberStatus.new_chat_member.user.first_name} vừa rời khỏi nhóm.`);
            }
        });

        await this.bot.start({
            allowed_updates: ['chat_member', 'message'],
        });
    }
}
