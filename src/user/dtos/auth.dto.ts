import { UserType } from '@prisma/client';
import {
	IsString,
	IsNotEmpty,
	IsEmail,
	MinLength,
	Matches,
	IsEnum,
	IsOptional,
} from 'class-validator';

export class SignupDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@Matches(/^(\+\d{1,2}\s)?\(?\d+\)?[\s.-]?\d+[\s.-]?\d+$/, {
		message: 'phone must be a valid phone number',
	})
	phone: string;

	@IsEmail()
	email: string;

	@MinLength(5)
	@IsString()
	password: string;

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	productKey?: string;
}

export class SigninDto {
	@IsEmail()
	email: string;

	@IsString()
	password: string;
}

export class GenerateProductKeyDto {
	@IsEmail()
	email: string;

	@IsEnum(UserType)
	userType: UserType;
}