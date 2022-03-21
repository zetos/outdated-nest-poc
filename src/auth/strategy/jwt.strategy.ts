import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: {
    sub: number;
    email: string;
    iat: number;
    exp: number;
  }) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
    });

    if (user) {
      const { hash: _, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    } else {
      return user;
    }
  }
}
