import { PartialType } from '@nestjs/swagger';
import { CreateAnnualBonusDto } from './create-annual-bonus.dto';

export class UpdateAnnualBonusDto extends PartialType(CreateAnnualBonusDto) {}

export class ApproveBonusDto {
  notes?: string;
}

export class RejectBonusDto {
  rejectionReason: string;
}




