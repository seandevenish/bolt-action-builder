import { Component, EnvironmentInjector, inject, Input, OnInit, runInInjectionContext } from '@angular/core';
import { Platoon } from '../platoon.class';
import { UnitSlotVisualizerOrchestrator } from '../unit-slot-visualiser-orchestrator.class';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { UnitSelector } from '../../units/unit-selector.class';
import { MatMenuModule } from '@angular/material/menu';
import { UnitSlotVisualiser } from '../unit-slot-visualiser.class';
import { IUnit, UnitFactory } from '../../units/unit.class';
import { MatDialog } from '@angular/material/dialog';
import { UnitDetailModalComponent } from '../../units/unit-detail-modal/unit-detail-modal.component';

@Component({
  selector: 'app-platoon',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatMenuModule, DecimalPipe],
  templateUrl: './platoon.component.html',
  styleUrl: './platoon.component.scss'
})
export class PlatoonComponent implements OnInit {

  @Input() platoon!: Platoon;
  @Input() unitSelectors!: UnitSelector[];

  visualiser!: UnitSlotVisualizerOrchestrator;

  constructor(private injector: EnvironmentInjector,
    private dialog: MatDialog
  ) {

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
    const unit = UnitFactory.generateNewUnit(selector, {
      specialRules: [],
      weapons: []
    });
    visualiser.addUnit(unit);
  }

  editUnit(unit: IUnit): void {
    const dialogRef = this.dialog.open(UnitDetailModalComponent, {
      panelClass: 'app-dialog-container',
      data: {
        unit: unit
      },
    });
    dialogRef
      .afterClosed()
      .subscribe((result: any|undefined) => {
        if (!result) {
          return;
        }
        //this.armies.push(result.army);
      });
  }

}
