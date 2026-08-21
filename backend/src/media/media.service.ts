import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class MediaService {
    private readonly logger = new Logger(MediaService.name);

    constructor(private configService: ConfigService) {
        cloudinary.config({
            cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
        });
    }

    async uploadImage(fileBuffer: Buffer, folder: string): Promise<string> {
        return new Promise((resolve, reject) => {
            cloudinary.uploader
                .upload_stream(
                    {
                        folder,
                        resource_type: 'image',
                        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
                    },
                    (error, result) => {
                        if (error) {
                            this.logger.error('Cloudinary upload error', error);
                            return reject(new InternalServerErrorException('Cloudinary image upload failed'));
                        }
                        resolve(result!.secure_url);
                    },
                )
                .end(fileBuffer);
        });
    }

    async uploadVideo(
        fileBuffer: Buffer,
        folder: string,
    ): Promise<{ url: string; thumbnailUrl: string }> {
        return new Promise((resolve, reject) => {
            cloudinary.uploader
                .upload_stream(
                    {
                        folder,
                        resource_type: 'video',
                        eager: [{ format: 'jpg', transformation: [{ width: 500, crop: 'scale' }] }],
                    },
                    (error, result) => {
                        if (error) {
                            this.logger.error('Cloudinary video upload error', error);
                            return reject(new InternalServerErrorException('Cloudinary video upload failed'));
                        }
                        const thumbnailUrl =
                            result!.eager && result!.eager[0] ? result!.eager[0].secure_url : '';
                        resolve({ url: result!.secure_url, thumbnailUrl });
                    },
                )
                .end(fileBuffer);
        });
    }

    async deleteMedia(publicId: string): Promise<void> {
        await cloudinary.uploader.destroy(publicId);
    }
}
