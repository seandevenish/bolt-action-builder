import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-armies-list',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './armies-list.component.html',
  styleUrl: './armies-list.component.scss',
})
export class ArmiesListComponent {}
