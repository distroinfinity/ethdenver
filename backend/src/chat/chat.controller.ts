import { Controller, Post, Get, Body } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async sendMessage(@Body() body: { userId: string; username: string; message: string }) {
    const { userId, username, message } = body;
    const response = await this.chatService.processMessage(userId, username, message);
    return { response };
  }

  @Get('messages')
  async getAllMessages() {
    return this.chatService.getAllMessages();
  }

  @Get('cost')
  async getCurrentChatCost() {
    const cost = await this.chatService.getCurrentChatCost();
    return { cost };
  }
}