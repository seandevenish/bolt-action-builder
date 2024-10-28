import { Component, EnvironmentInjector, inject, Input, OnDestroy, OnInit, runInInjectionContext } from '@angular/core';
import { Platoon } from '../platoon.class';
import { UnitSlotVisualizerOrchestrator } from '../unit-slot-visualiser-orchestrator.class';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { UnitSelector } from '../../units/unit-selector.class';
import { MatMenuModule } from '@angular/material/menu';
import { UnitSlotVisualiser } from '../unit-slot-visualiser.class';
import { Unit } from '../../units/unit.class';
import { UnitFactory } from "../../units/unit-factory";
import { MatDialog } from '@angular/material/dialog';
import { UnitDetailModalComponent } from '../../units/unit-detail-modal/unit-detail-modal.component';
import { Subject, takeUntil, tap } from 'rxjs';
import { Library } from '../../units/library.interface';

@Component({
  selector: 'app-platoon',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatMenuModule, DecimalPipe],
  templateUrl: './platoon.component.html',
  styleUrl: './platoon.component.scss'
})
export class PlatoonComponent implements OnInit, OnDestroy {

  @Input() platoon!: Platoon;
  @Input() library!: Library;

  orchestrator!: UnitSlotVisualizerOrchestrator;

  private readonly _unsubscribeAll$ = new Subject<void>();

  constructor(private injector: EnvironmentInjector,
    private dialog: MatDialog
  ) {

  }

  ngOnInit(): void {
    runInInjectionContext(this.injector, () => {
      this.orchestrator = new UnitSlotVisualizerOrchestrator(
        this.platoon.selector?.unitRequirements ?? [],
        this.platoon.units$.getValue(),
        this.library
      );

      this.orchestrator.allUnits$.pipe(
        tap(u => this.platoon.updateUnits(u as Unit[])),
        takeUntil(this._unsubscribeAll$)
      ).subscribe();
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll$.next();
    this._unsubscribeAll$.complete();
  }

  addUnit(visualiser: UnitSlotVisualiser, selector: UnitSelector) {
    const unit = UnitFactory.generateNewUnit(selector, this.library);
    visualiser.addUnit(unit);
  }

  editUnit(visualiser: UnitSlotVisualiser, unit: Unit): void {
    const dialogRef = this.dialog.open(UnitDetailModalComponent, {
      panelClass: 'app-dialog-container',
      data: {
        unit: unit,
        library: this.library
      },
    });
    dialogRef
      .afterClosed()
      .subscribe((result: any|undefined) => {
        if (result.action === 'Delete') {
          visualiser.removeUnit(unit);
          return;
        }
      });
  }

}
