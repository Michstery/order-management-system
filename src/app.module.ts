import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { UsersModule } from './entities/users/users.module';
import { ProductsModule } from './entities/products/products.module';
import { OrdersModule } from './entities/orders/orders.module';
import configuration from './config/configuration';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('database.uri'),
      }),
      inject: [ConfigService],
    }),
    // Register CacheModule globally
    CacheModule.register({
      ttl: 60, // Time-to-live in seconds (e.g., 60 seconds)
      max: 100, // Maximum number of items in cache
      isGlobal: true, // Make cache available across all modules
    }),
    // Register ThrottlerModule globally
    ThrottlerModule.forRoot({
      throttlers: [{
        ttl: 60, // Time-to-live in seconds (1 minute)
        limit: 10, // Max requests per TTL per IP
      }],
    }),
    UsersModule,
    ProductsModule,
    OrdersModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}