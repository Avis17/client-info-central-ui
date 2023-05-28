import { CanActivateFn } from '@angular/router';
import { AuthGuardService } from '../services/auth-guard.service';
import { inject } from '@angular/core';

export const clientGuard: CanActivateFn = (route, state) => {
  return inject(AuthGuardService).canClientActivate();
};
