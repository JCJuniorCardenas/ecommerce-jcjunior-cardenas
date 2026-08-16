import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    const maxRetries = 8;
    const baseDelayMs = 1500;

    for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
      try {
        await this.$connect();
        if (attempt > 1) {
          this.logger.log(`Connected to database on attempt ${attempt}/${maxRetries}`);
        }
        return;
      } catch (error) {
        const isLastAttempt = attempt === maxRetries;
        this.logger.warn(
          `Database connection attempt ${attempt}/${maxRetries} failed. ${isLastAttempt ? 'No retries left.' : 'Retrying...'} ` +
            `${error instanceof Error ? error.message : String(error)}`,
        );

        if (isLastAttempt) {
          throw error;
        }

        const delayMs = baseDelayMs * attempt;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
