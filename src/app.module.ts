import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './user/user.controller';
import { BlogController } from './blog/blog.controller';
import { AuthorizationMiddleware } from './authorization.middleware';
@Module({
  imports: [],
  controllers: [AppController, UserController, BlogController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthorizationMiddleware)
      .exclude({ path: 'blog', method: RequestMethod.GET })
      .forRoutes(BlogController);
  }
}
