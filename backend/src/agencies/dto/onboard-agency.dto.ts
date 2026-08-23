import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OnboardAgencyDto {
    @ApiProperty({ example: 'Addis Foreign Employment Agency' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'ETH-PEA-2026-0892' })
    @IsString()
    @IsNotEmpty()
    licenseNumber: string;

    @ApiPropertyOptional({ example: '2028-12-31' })
    @IsOptional()
    @IsString()
    licenseExpiry?: string;

    @ApiProperty({ example: 'Addis Ababa' })
    @IsString()
    @IsNotEmpty()
    city: string;

    @ApiProperty({ example: 'Ethiopia' })
    @IsString()
    @IsNotEmpty()
    country: string;

    @ApiProperty({ example: '+251911000000' })
    @IsString()
    @IsNotEmpty()
    contactPhone: string;

    @ApiProperty({ example: 'info@addisagency.et' })
    @IsEmail()
    @IsNotEmpty()
    contactEmail: string;

    @ApiPropertyOptional({ example: 'https://addisagency.et' })
    @IsOptional()
    @IsString()
    websiteUrl?: string;

    @ApiPropertyOptional({ example: 'https://res.cloudinary.com/demo/logo.png' })
    @IsOptional()
    @IsString()
    logoUrl?: string;

    @ApiPropertyOptional({ example: 'TIN-987654321' })
    @IsOptional()
    @IsString()
    taxId?: string;
}
