import { Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { randomBytes, timingSafeEqual } from 'crypto';
import { AuthService } from './auth.service';

const enc = (s: string) => Buffer.from(s).toString('base64url');
const dec = (s: string) => Buffer.from(s, 'base64url').toString();
function cookies(req: Request) { return Object.fromEntries((req.headers.cookie ?? '').split(';').filter(Boolean).map(v=>{const [k,...r]=v.trim().split('=');return [k,decodeURIComponent(r.join('='))]})); }
function safeNext(value: unknown) {
  if (typeof value !== 'string') return '/';

  const hasControlCharacter = [...value].some((char) => {
    const code = char.charCodeAt(0);
    return code <= 31 || code === 127;
  });

  if (
    value.length < 1 ||
    value.length > 512 ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.includes('\\') ||
    hasControlCharacter ||
    value === '/auth' ||
    value.startsWith('/auth/')
  ) {
    return '/';
  }

  return value;
}
@Controller('auth')
export class AuthController {
  constructor(private readonly config: ConfigService, private readonly auth: AuthService) {}
  private secure() { return this.config.get('NODE_ENV') === 'production'; }
  @Get('login') login(@Query('next') next: string | undefined, @Res() res: Response) {
    const state = randomBytes(32).toString('base64url'); const target = safeNext(next);
    res.setHeader('Cache-Control','no-store');
    res.cookie(this.auth.stateCookieName(), `${state}.${enc(target)}`, { httpOnly:true, sameSite:'lax', secure:this.secure(), path:'/auth/callback', maxAge:600000 });
    const hub = this.config.getOrThrow<string>('CORE_HUB_WEB_URL'); const subsystem = this.config.getOrThrow<string>('SUBSYSTEM_ID');
    res.redirect(302, `${hub}/sso/authorize?subsystem=${encodeURIComponent(subsystem)}&state=${encodeURIComponent(state)}`);
  }
  @Get('callback') async callback(@Query('access_token') token: string | undefined, @Query('state') state: string | undefined, @Req() req: Request, @Res() res: Response) {
    res.setHeader('Cache-Control','no-store'); res.setHeader('Referrer-Policy','no-referrer');
    if (!token) return res.status(400).json({success:false,error:{code:'VALIDATION_ERROR',message:'Missing access_token'}});
    if (!state) return res.redirect(302,'/auth/login');
    const stored = cookies(req)[this.auth.stateCookieName()];
    res.clearCookie(this.auth.stateCookieName(), { path:'/auth/callback', httpOnly:true, sameSite:'lax', secure:this.secure() });
    if (!stored) return res.status(401).send('<!doctype html><meta charset="utf-8"><title>เข้าสู่ระบบใหม่</title><p>เซสชันเข้าสู่ระบบหมดอายุหรือไม่ถูกต้อง</p><a href="/auth/login">เข้าสู่ระบบอีกครั้ง</a>');
    const [expected, encodedNext=''] = stored.split('.',2); const a=Buffer.from(expected); const b=Buffer.from(state);
    if (a.length !== b.length || !timingSafeEqual(a,b)) return res.status(401).send('<!doctype html><meta charset="utf-8"><a href="/auth/login">เข้าสู่ระบบอีกครั้ง</a>');
    const payload = await this.auth.verify(token); const maxAge = Math.max(0, (payload.exp! * 1000) - Date.now());
    res.cookie(this.auth.cookieName(), token, { httpOnly:true, sameSite:'lax', secure:this.secure(), path:'/', maxAge });
    let next='/'; try { next=safeNext(dec(encodedNext)); } catch { next='/'; } return res.redirect(302,next);
  }
  @Post('logout') logout(@Res() res: Response) {
    res.setHeader('Cache-Control', 'no-store');
    res.cookie(this.auth.cookieName(), '', {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.secure(),
      path: '/',
      maxAge: 0,
    });
    res.clearCookie(this.auth.stateCookieName(), {
      path: '/auth/callback',
      httpOnly: true,
      sameSite: 'lax',
      secure: this.secure(),
    });
    return res.redirect(
      303,
      `${this.config.getOrThrow<string>('CORE_HUB_WEB_URL')}/logout`,
    );
  }
}
