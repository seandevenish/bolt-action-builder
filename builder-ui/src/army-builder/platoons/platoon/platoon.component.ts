import { Component, EnvironmentInjector, inject, Input, OnInit, runInInjectionContext } from '@angular/core';
import { Platoon } from '../platoon.class';
import { UnitSlotVisualizerOrchestrator } from '../unit-slot-visualiser-orchestrator.class';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { UnitSelector } from '../../units/unit-selector.class';
import { MatMenuModule } from '@angular/material/menu';
import { UnitSlot } from '../unit-slot.interface';
import { UnitSlotVisualiser } from '../unit-slot-visualiser.class';
import { Unit, UnitFactory } from '../../units/unit.class';

@Component({
  selector: 'app-platoon',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatMenuModule],
  templateUrl: './platoon.component.html',
  styleUrl: './platoon.component.scss'
})
export class PlatoonComponent implements OnInit {

  @Input() platoon!: Platoon;
  @Input() unitSelectors!: UnitSelector[];

  visualiser!: UnitSlotVisualizerOrchestrator;

  constructor(private injector: EnvironmentInjector) {

  }

  ngOnInit(): void {
    runInInjectionContext(this.injector, () => {
      this.visualiser = new UnitSlotVisualizerOrchestrator(
        this.platoon.selector?.unitRequirements ?? [],
        this.unitSelectors
      );
    });
  }

  addUnit(visualiser: UnitSlotVisualiser, selector: UnitSelector) {
    const unit = UnitFactory.generateNewUnit(selector);
    visualiser.addUnit(unit);
  }

}
