import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import * as nodemailer from 'nodemailer';

export interface ScheduleCreatedPayload {
  customerEmail: string;
  customerName: string;
  doctorName: string;
  objective: string;
  scheduledAt: Date;
}

export interface ScheduleDeletedPayload {
  customerEmail: string;
  customerName: string;
  doctorName: string;
  scheduledAt: Date;
}

@Processor('email-queue')
export class NotificationProcessor {
  private transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT) || 2525,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  @Process('schedule-created')
  async handleScheduleCreated(job: Job<ScheduleCreatedPayload>) {
    const { customerEmail, customerName, doctorName, objective, scheduledAt } = job.data;

    await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: customerEmail,
      subject: 'Jadwal Konsultasi Berhasil Dibuat',
      html: `
        <h2>Halo, ${customerName}!</h2>
        <p>Jadwal konsultasi Anda telah berhasil dibuat.</p>
        <table>
          <tr><td><strong>Dokter</strong></td><td>${doctorName}</td></tr>
          <tr><td><strong>Tujuan</strong></td><td>${objective}</td></tr>
          <tr><td><strong>Waktu</strong></td><td>${new Date(scheduledAt).toLocaleString('id-ID')}</td></tr>
        </table>
        <p>Harap hadir tepat waktu.</p>
      `,
    });
  }

  @Process('schedule-deleted')
  async handleScheduleDeleted(job: Job<ScheduleDeletedPayload>) {
    const { customerEmail, customerName, doctorName, scheduledAt } = job.data;

    await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: customerEmail,
      subject: 'Jadwal Konsultasi Dibatalkan',
      html: `
        <h2>Halo, ${customerName}!</h2>
        <p>Jadwal konsultasi Anda telah dibatalkan.</p>
        <table>
          <tr><td><strong>Dokter</strong></td><td>${doctorName}</td></tr>
          <tr><td><strong>Waktu</strong></td><td>${new Date(scheduledAt).toLocaleString('id-ID')}</td></tr>
        </table>
        <p>Silakan buat jadwal baru jika diperlukan.</p>
      `,
    });
  }
}
