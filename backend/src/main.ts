import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
    const logger = new Logger('Bootstrap');
    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter({ logger: true }),
    );

    // Global Prefix
    app.setGlobalPrefix('api/v1');

    // Global Pipes & Validation
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
        }),
    );

    // Enable CORS
    app.enableCors({
        origin: '*',
        credentials: true,
    });

    // OpenAPI / Swagger Documentation
    const config = new DocumentBuilder()
        .setTitle('Ethiopian Recruitment Agency SaaS API')
        .setDescription('NestJS + Fastify REST API documentation for Recruitment Platform')
        .setVersion('2.0')
        .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'user-jwt')
        .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'admin-jwt')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/v1/docs', app, document);

    const port = process.env.PORT || 5000;
    await app.listen(port, '0.0.0.0');
    logger.log(`Server listening on port ${port} - OpenAPI docs at http://localhost:${port}/api/v1/docs`);
}

bootstrap();
