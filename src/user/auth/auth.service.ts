import { ConflictException, HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bycrypt from 'bcryptjs'
import { UserType } from '@prisma/client';
import * as jwt from 'jsonwebtoken';

interface SignupParams {
	email: string;
	password: string;
	name: string;
	phone: string;
}

interface SigninParams {
	email: string;
	password: string;
}

@Injectable()
export class AuthService {
	constructor(private readonly prismaService: PrismaService) {}

	async signup({ email, password, name, phone }: SignupParams, UserType: UserType): Promise<string> {
		const userExists = await this.prismaService.user.findUnique({
			where: {
				email,
			},
		});
        if (userExists) {
            throw new ConflictException('User already exists');
        }
		const hashedPassword = await bycrypt.hash(password, 10);

		const user = await this.prismaService.user.create({
			data: {
				email,
				name,
				phone,
				password: hashedPassword,
				user_type: UserType,
			},
		});

        return this.generateJWT(user.name, user.id);
        
    }

    async signin({email, password}:SigninParams) {
        const user = await this.prismaService.user.findUnique({
            where: {
                email
            }
        })

        if (!user) { 
            throw new HttpException("Invalid Credentials",404)
        }

        const hashedPassword = user.password

        const isValidPassword = await bycrypt.compare(password,hashedPassword)
    
        if (!isValidPassword) {
					throw new HttpException('Invalid Credentials', 404);
        }
        
        return this.generateJWT(user.name,user.id)
    }

    private generateJWT(name: string, id: number) {
        return jwt.sign(
					{
						name,
						id,
					},
					process.env.TOKEN_SECRET_KEY,
					{ expiresIn: process.env.EXPIRES_TIMEOUT },
				);
    }

    generateProductKey(email: string, userType: UserType) {
        const credentials = `${email}-${userType}-${process.env.GENERATED_KEY}`;
        return bycrypt.hash(credentials,10)
    }
}
