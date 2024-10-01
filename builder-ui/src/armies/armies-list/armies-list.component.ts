import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Army, factionLibrary } from '../army.class';
import { NgFor } from '@angular/common';
import { ArmyCardComponent } from '../army-card/army-card.component';

@Component({
  selector: 'app-armies-list',
  standalone: true,
  imports: [MatIconModule, NgFor, ArmyCardComponent],
  templateUrl: './armies-list.component.html',
  styleUrl: './armies-list.component.scss',
})
export class ArmiesListComponent {

  armies = [
    new Army('Test Army', 'US'), 
    new Army('Another', 'US')
  ];

  constructor() {
    this.armies.forEach((a) => a.loadProperties(factionLibrary));
  }
  
}
