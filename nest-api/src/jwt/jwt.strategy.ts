import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('Missing JWT_SECRET');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
    });
  }

  // payload: { sub, email, role, iat, exp }
  async validate(payload: any) {
    // 1) opcional: buscar o usuário no banco e garantir que ele ainda existe/está ativo
    const user = await this.usersService.findOne(payload.sub);
    if (!user) throw new UnauthorizedException('Usuário inexistente');

    // 2) retornar o objeto que será colocado em req.user
    // evite retornar a senha!
    return { id: user._id, email: user.email, role: user.role };
  }
}
