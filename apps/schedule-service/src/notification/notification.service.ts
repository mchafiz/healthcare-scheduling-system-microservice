import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ScheduleCreatedPayload, ScheduleDeletedPayload } from './notification.processor';

@Injectable()
export class NotificationService {
  constructor(@InjectQueue('email-queue') private emailQueue: Queue) {}

  async notifyScheduleCreated(payload: ScheduleCreatedPayload) {
    await this.emailQueue.add('schedule-created', payload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });
  }

  async notifyScheduleDeleted(payload: ScheduleDeletedPayload) {
    await this.emailQueue.add('schedule-deleted', payload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });
  }
}
