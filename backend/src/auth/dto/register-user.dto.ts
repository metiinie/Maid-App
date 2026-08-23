import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterUserDto {
    @ApiProperty({ example: '+251911223344', description: 'User phone number' })
    @IsString()
    @IsNotEmpty()
    phone: string;

    @ApiProperty({ example: '1234', description: 'User PIN or password' })
    @IsString()
    @IsNotEmpty()
    @MinLength(4)
    password: string;

    @ApiProperty({ example: 'Almaz', description: 'First name' })
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({ example: 'Tesfaye', description: 'Last name' })
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiPropertyOptional({ example: 'almaz@example.com' })
    @IsOptional()
    @IsString()
    email?: string;

    @ApiPropertyOptional({ example: 'JOB_SEEKER', enum: ['JOB_SEEKER', 'EMPLOYER', 'jobseeker', 'employer'] })
    @IsOptional()
    @IsString()
    role?: string;
}
