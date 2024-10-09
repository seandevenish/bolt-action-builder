import { Component, Input } from '@angular/core';
import { Platoon } from '../platoon.class';

@Component({
  selector: 'app-platoon',
  standalone: true,
  imports: [],
  templateUrl: './platoon.component.html',
  styleUrl: './platoon.component.scss'
})
export class PlatoonComponent {
  @Input() platoon!: Platoon;
}
