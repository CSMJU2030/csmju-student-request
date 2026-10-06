import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { LinkType } from './generated/prisma/enums';

export class ServiceInputDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  label!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsBoolean()
  isRequired!: boolean;
}

export class ServiceStepDto {
  @IsInt()
  @Min(1)
  stepNo!: number;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  description!: string;

  @IsBoolean()
  requiresSignature!: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;
}

export class ServiceDocumentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsBoolean()
  isRequired!: boolean;
}

export class ServiceLinkDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title!: string;

  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
  })
  url!: string;

  @IsEnum(LinkType)
  linkType!: LinkType;
}

export class ServiceContactDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  channel!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  value!: string;
}

export class CreateServiceDto {
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  @Matches(/^[A-Z0-9_]+$/)
  code!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  description!: string;

  @IsOptional()
  @IsDateString()
  lastVerifiedAt?: string;

  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => ServiceInputDto)
  inputs!: ServiceInputDto[];

  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => ServiceStepDto)
  steps!: ServiceStepDto[];

  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => ServiceDocumentDto)
  documents!: ServiceDocumentDto[];

  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => ServiceLinkDto)
  links!: ServiceLinkDto[];

  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => ServiceContactDto)
  contacts!: ServiceContactDto[];
}

export class UpdateServiceDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  @Matches(/^[A-Z0-9_]+$/)
  code?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  description?: string;

  @IsOptional()
  @IsDateString()
  lastVerifiedAt?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => ServiceInputDto)
  inputs?: ServiceInputDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => ServiceStepDto)
  steps?: ServiceStepDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => ServiceDocumentDto)
  documents?: ServiceDocumentDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => ServiceLinkDto)
  links?: ServiceLinkDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => ServiceContactDto)
  contacts?: ServiceContactDto[];
}
