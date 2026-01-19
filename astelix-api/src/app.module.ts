import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SignalsModule } from './core/signals/signals.module';
import { UsersModule } from './users/users.module';
import { TemporalModule } from './core/temporal/temporal.module';
import { DecisionsModule } from './core/decisions/decisions.module';
import { OrchestratorModule } from './core/orchestrator/orchestrator.module';
import { SandboxModule } from './sandbox/sandbox.module';
import { DemoModule } from './demo/demo.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'sandbox.db',
      autoLoadEntities: true,
      synchronize: true, // OK for sandbox only
    }),

    SignalsModule,
    UsersModule,
    TemporalModule,
    DecisionsModule,
    OrchestratorModule,
    SandboxModule,
    DemoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
