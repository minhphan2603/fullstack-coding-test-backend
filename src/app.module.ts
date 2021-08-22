import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './user/user.controller';
import { BlogController } from './blog/blog.controller';

@Module({
  imports: [],
  controllers: [AppController, UserController, BlogController],
  providers: [AppService],
})
export class AppModule {}
