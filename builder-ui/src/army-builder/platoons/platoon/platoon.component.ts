import { Component, Input, OnInit } from '@angular/core';
import { Platoon } from '../platoon.class';
import { UnitSlotVisualizerOrchestrator } from '../unit-slot-visualiser-orchestrator.class';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-platoon',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule],
  templateUrl: './platoon.component.html',
  styleUrl: './platoon.component.scss'
})
export class PlatoonComponent implements OnInit {

  @Input() platoon!: Platoon;

  visualiser!: UnitSlotVisualizerOrchestrator;

  constructor() {

  }

  ngOnInit(): void {
    this.visualiser = new UnitSlotVisualizerOrchestrator(this.platoon.selector?.unitRequirements ?? []);
  }


}
