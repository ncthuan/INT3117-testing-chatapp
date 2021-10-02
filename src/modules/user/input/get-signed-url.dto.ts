import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty } from 'class-validator';
import { FileType } from '@db/entities/message.entity';

export class GetSignedUrlDto {
  @IsNotEmpty()
  @ApiProperty({ type: 'string' })
  fileName: string;

  @ApiProperty({ required: true, enum: FileType, default: FileType.image })
  @IsNotEmpty()
  @IsEnum(FileType)
  fileType: FileType;
}
