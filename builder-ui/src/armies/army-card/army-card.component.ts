import { Component, Input } from '@angular/core';
import { Army } from '../army.class';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-army-card',
  standalone: true,
  imports: [MatCardModule],
  templateUrl: './army-card.component.html',
  styleUrl: './army-card.component.scss',
})
export class ArmyCardComponent {
  @Input() army?: Army;
}
