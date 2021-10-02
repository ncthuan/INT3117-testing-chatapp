import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RoomEvent } from '@common/events/room.event';

export function setupSwagger(app: INestApplication, basePath: string): void {
  const options = new DocumentBuilder()
    .setTitle('API Document')
    .setVersion('1.0')
    .addServer(basePath)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options, {
    extraModels: [RoomEvent],
  });
  SwaggerModule.setup('docs', app, document);
}
