import { Injectable } from '@angular/core';
import { APP_CONSTANTS } from '../config/app.constants';

@Injectable({ providedIn: 'root' })
export class TokenService {
  setToken(token: string): void {
    localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.TOKEN, token);
  }

  getToken(): string | null {
    return localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.TOKEN);
  }

  setUserName(name: string): void {
    localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.USERNAME, name);
  }

  getUserName(): string | null {
    return localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.USERNAME);
  }

  setUserId(id: string): void {
    localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.USER_ID, id);
  }

  getUserId(): string | null {
    return localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.USER_ID);
  }

  setAuthorities(role: string): void {
    localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.AUTHORITIES, JSON.stringify(role ?? ''));
  }

  getAuthorities(): string {
    const raw = localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.AUTHORITIES);
    if (!raw) {
      return '';
    }
    try {
      return (JSON.parse(raw) as string) ?? '';
    } catch {
      return '';
    }
  }

  logOut(): void {
    localStorage.clear();
  }
}
