import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsObject, Min, Max } from 'class-validator';
import { BonusStatus } from '../annual-bonus.schema';

export class CalculationCriteriaDto {
  @ApiProperty({ example: 85, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  performanceScore?: number;

  @ApiProperty({ example: 50, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tasksCompleted?: number;

  @ApiProperty({ example: 95, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  tasksCompletedPercentage?: number;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  campaignsCompleted?: number;

  @ApiProperty({ example: 98, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  attendanceRate?: number;

  @ApiProperty({ type: 'object', additionalProperties: true })
  @IsOptional()
  @IsObject()
  customFactors?: Record<string, number>;
}

export class CreateAnnualBonusDto {
  @ApiProperty({ example: '60d0fe4f3a7c7d001c8b4567' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 2024, minimum: 2000, maximum: 2100 })
  @IsNumber()
  @Min(2000)
  @Max(2100)
  year: number;

  @ApiProperty({ example: 15000 })
  @IsNumber()
  @Min(0)
  bonusAmount: number;

  @ApiProperty({ example: 'TRY', required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ enum: BonusStatus, required: false })
  @IsOptional()
  @IsString()
  status?: BonusStatus;

  @ApiProperty({ type: CalculationCriteriaDto, required: false })
  @IsOptional()
  @IsObject()
  calculationCriteria?: CalculationCriteriaDto;

  @ApiProperty({ example: 'Yıllık performans bonusu', required: false })
  @IsOptional()
  @IsString()
  calculationNotes?: string;

  @ApiProperty({ example: 'Ek notlar', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

