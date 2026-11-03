import { TokenService } from './token.service';

describe('TokenService', () => {
  let service: TokenService;

  beforeEach(() => {
    localStorage.clear();
    service = new TokenService();
  });

  it('guarda y recupera el token', () => {
    service.setToken('abc123');
    expect(service.getToken()).toBe('abc123');
  });

  it('guarda y recupera userId y userName', () => {
    service.setUserId('42');
    service.setUserName('pepe');
    expect(service.getUserId()).toBe('42');
    expect(service.getUserName()).toBe('pepe');
  });

  it('getAuthorities devuelve cadena vacía sin datos', () => {
    expect(service.getAuthorities()).toBe('');
  });

  it('getAuthorities devuelve el rol guardado', () => {
    service.setAuthorities('Admin');
    expect(service.getAuthorities()).toBe('Admin');
  });

  it('logOut limpia el storage', () => {
    service.setToken('abc');
    service.setUserId('42');
    service.logOut();
    expect(service.getToken()).toBeNull();
    expect(service.getUserId()).toBeNull();
  });
});
