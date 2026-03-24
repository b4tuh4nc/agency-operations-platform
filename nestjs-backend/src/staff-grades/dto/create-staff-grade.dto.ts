import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, Min, Max } from 'class-validator';

export class CreateStaffGradeDto {
  @ApiProperty({ example: 'Senior Graphic Designer' })
  @IsString()
  gradeName: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 10 })
  @IsNumber()
  @Min(1)
  @Max(10)
  gradeLevel: number;

  @ApiProperty({ example: 'Senior level creative staff', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'creative', required: false })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}




