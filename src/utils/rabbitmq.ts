import amqplib from 'amqplib';
import { Logger } from '@nestjs/common';
import { sendEmail } from './send-email';
import { sendEmailDto } from './dto/send-email.dto';

const queue = 'sendVerificationEmail';
let conn: amqplib.ChannelModel;
const logger = new Logger('RabbitMQ');

const rabbitmq = async () => {
  conn = await amqplib.connect('amqp://localhost');

  const channel = await conn.createChannel();
  await channel.assertQueue(queue);

  // Listener
  channel.consume(queue, async (msg) => {
    if (msg !== null) {
      const raw = msg.content.toString("utf-8");
      const data: sendEmailDto = JSON.parse(raw);
      await sendEmail({
        email: data.email,
        subject: data.subject,
        html: data.body,
      });
      channel.ack(msg);
    } else {
      logger.warn('Consumer cancelled by server');
    }
  });
};

const sendEmailQueue = async (data: sendEmailDto) => {
    const channel = await conn.createChannel();
    const payload = JSON.stringify(data);
    channel.sendToQueue(queue, Buffer.from(payload, "utf-8"));
}

export {
    sendEmailQueue,
    rabbitmq
}
