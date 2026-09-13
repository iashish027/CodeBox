import { Routes } from '@angular/router';

import { EmptyPageComponent } from './pages/empty-page.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';

export const routes: Routes = [
  { path: '', component: EmptyPageComponent, pathMatch: 'full' },
  { path: 'login', component: EmptyPageComponent },
  { path: 'problems', component: EmptyPageComponent },
  { path: 'contest', component: EmptyPageComponent },
  { path: 'signup', component: SignUpComponent }
];
