import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPinDto {
    @ApiProperty({ example: '+251911223344' })
    @IsString()
    @IsNotEmpty()
    phone: string;

    @ApiProperty({ example: '123456' })
    @IsString()
    @IsNotEmpty()
    otp: string;

    @ApiProperty({ example: '5678' })
    @IsString()
    @IsNotEmpty()
    @MinLength(4)
    newPin: string;
}
