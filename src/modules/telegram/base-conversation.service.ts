import { get } from 'lodash';

import { MyContext, MyConversation } from '@modules/telegram/telegram.service';

/**
 * BaseConversationService - Class generic cho quản lý hội thoại với trạng thái
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars,unused-imports/no-unused-vars
export class BaseConversationService<TState extends string> {
    /**
     * @template TState - Kiểu trạng thái
     * Hàm chính để quản lý hội thoại theo trạng thái
     * @param {MyConversation} conversation - Cuộc hội thoại hiện tại
     * @param {MyContext} ctx - Context của bot
     * @param {Record<TState, (conversation: MyConversation, ctx: MyContext) => Promise<TState | void>>} stateHandlers - Các trạng thái và hàm xử lý tương ứng
     * @param {TState} initialState - Trạng thái khởi đầu của hội thoại
     * @returns {Promise<void>} - Kết quả hội thoại
     */
    async runConversation<TState extends string | number | symbol>(
        conversation: MyConversation,
        ctx: MyContext,
        stateHandlers: Record<TState, (conversation: MyConversation, ctx: MyContext) => Promise<TState | void>>,
        initialState: TState,
    ): Promise<void> {
        let currentState: TState = initialState;

        while (currentState !== ('DONE' as TState)) {
            const handler = get(stateHandlers, currentState);

            if (handler) {
                const nextState = await handler(conversation, ctx);

                currentState = nextState || ('DONE' as TState);
            } else {
                await ctx.reply('Error: Invalid state. Exiting conversation.');
                break;
            }
        }
    }
}
