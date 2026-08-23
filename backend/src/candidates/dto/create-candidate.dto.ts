import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCandidateDto {
    @ApiProperty({ example: 'org-uuid-123', description: 'Organization/Agency UUID' })
    @IsString()
    @IsNotEmpty()
    agencyId: string;

    @ApiProperty({ example: 'cat-uuid-456', description: 'Category UUID' })
    @IsString()
    @IsNotEmpty()
    categoryId: string;

    @ApiProperty({ example: 'Alem' })
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({ example: 'Tadesse' })
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiPropertyOptional({ example: 'female' })
    @IsOptional()
    @IsString()
    gender?: string;

    @ApiPropertyOptional({ example: '1995-05-15' })
    @IsOptional()
    @IsDateString()
    dateOfBirth?: string;

    @ApiPropertyOptional({ example: 'Ethiopian' })
    @IsOptional()
    @IsString()
    nationality?: string;

    @ApiPropertyOptional({ example: 'Orthodox' })
    @IsOptional()
    @IsString()
    religion?: string;

    @ApiPropertyOptional({ example: 'Single' })
    @IsOptional()
    @IsString()
    maritalStatus?: string;

    @ApiPropertyOptional({ example: 'Ethiopia' })
    @IsOptional()
    @IsString()
    currentCountry?: string;

    @ApiPropertyOptional({ example: 'Addis Ababa' })
    @IsOptional()
    @IsString()
    city?: string;

    @ApiPropertyOptional({ example: 'Experienced housemaid with cooking skills' })
    @IsOptional()
    @IsString()
    summary?: string;

    @ApiPropertyOptional({ example: 'High School' })
    @IsOptional()
    @IsString()
    educationLevel?: string;

    @ApiPropertyOptional({ example: 3 })
    @IsOptional()
    @IsNumber()
    yearsOfExperience?: number;

    @ApiPropertyOptional({ example: 'pending' })
    @IsOptional()
    @IsString()
    medicalStatus?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    photoUrl?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    videoUrl?: string;

    @ApiPropertyOptional({ example: ['Cooking', 'Cleaning'] })
    @IsOptional()
    @IsArray()
    skills?: string[];

    @ApiPropertyOptional({ example: ['Amharic', 'Arabic'] })
    @IsOptional()
    @IsArray()
    languages?: string[];
}
