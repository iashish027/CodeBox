import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  path: string;
  label: string;
  exact: boolean;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  protected readonly navItems: NavItem[] = [
    { path: '/', label: 'HOME', exact: true },
    { path: '/problems', label: 'PROBLEMSET', exact: false },
    { path: '/contest', label: 'CONTEST', exact: false }
  ];
}
