import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';

export class CreateSalaryDto {
  @ApiProperty({ example: '60d0fe4f3a7c7d001c8b4567' })
  @IsString()
  userId: string;

  @ApiProperty({ example: '60d0fe4f3a7c7d001c8b4568', required: false })
  @IsOptional()
  @IsString()
  gradeId?: string;

  @ApiProperty({ example: 15000 })
  @IsNumber()
  @Min(0)
  baseSalary: number;

  @ApiProperty({ example: 2000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  bonus?: number;

  @ApiProperty({ example: 1000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  allowances?: number;

  @ApiProperty({ example: 'TRY', required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ example: '2025-01-01', required: false })
  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @ApiProperty({ example: 'Monthly salary', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}




