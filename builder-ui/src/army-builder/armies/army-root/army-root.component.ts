import { AfterViewInit, Component, NgZone, OnDestroy, OnInit, QueryList, Signal, signal, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, combineLatest, EMPTY, finalize, from, map, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import {MatSnackBar} from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAccordion, MatExpansionModule, MatExpansionPanel } from '@angular/material/expansion'
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ConfirmationService } from '../../../app/services/confirmation.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { PlatoonSelector } from '../../platoons/platoon-selector.class';
import { Platoon } from '../../platoons/platoon.class';
import { PlatoonComponent } from '../../platoons/platoon/platoon.component';
import { Army } from '../army.class';
import { ArmyService } from '../army.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { IArmyInfo } from '../army-info.interface';
import { FirestoreError } from 'firebase/firestore';
import { Library } from '../../units/library.interface';
import { generateGuid } from '../../../app/utilities/guid';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-army-root',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, MatButtonModule, MatProgressSpinnerModule, MatIconModule, MatMenuModule, MatToolbarModule, MatTooltipModule, MatExpansionModule, PlatoonComponent, DragDropModule],
  templateUrl: './army-root.component.html',
  styleUrl: './army-root.component.scss'
})
export class ArmyRootComponent implements OnInit, OnDestroy, AfterViewInit {

  error: any;

  army = signal<Army|null>(null);
  platoons = signal<Platoon[]>([]);
  loading = signal(false);
  saving = signal<false|'saveOnly'|'saveAndClose'>(false);
  pendingAdd = false;

  multiExpand = signal(false);
  totalCost = toSignal(
    // Convert platoons signal to an observable
    toObservable(this.platoons).pipe(
      // Switch to a new observable whenever platoons change
      switchMap(platoons => {
        if (platoons.length === 0) {
          return of(0); // If no platoons, total cost is 0
        }
        // Map each platoon's cost$ observable
        const costObservables = platoons.map(platoon => platoon.cost$);
        // Combine the cost$ observables
        return combineLatest(costObservables).pipe(
          // Sum up the costs
          map(costs => costs.reduce((sum, cost) => sum + cost, 0))
        );
      })
    ),
    { initialValue: 0 } // Provide an initial value
  );

  library!: Library;

  private readonly _unsubscribeAll$ = new Subject<void>();

  @ViewChildren(MatAccordion) expansionAccordions!: QueryList<MatAccordion>;
  @ViewChildren('platoonPanel') expansionPanels!: QueryList<MatExpansionPanel>;

  constructor(private readonly _armyService: ArmyService,
    private readonly _route: ActivatedRoute,
    private readonly _router: Router,
    private readonly _confirmationService: ConfirmationService,
    private readonly _ngZone: NgZone,
    private readonly _snackbar: MatSnackBar
  ) {

  }

  ngOnInit(): void {
    this._route.paramMap.pipe(
      map(p => p.get('armyId') as string),
      tap(p => this.loading.set(true)),
      switchMap(armyId => from(this._armyService.loadArmyInfo(armyId)).pipe(
        catchError(e => {
          this.showError(e);
          this.loading.set(false);
          return EMPTY;
        }),
        finalize(() => this.loading.set(false))
      )),
      tap((armyInfo: IArmyInfo) => {
        this.army.set(armyInfo.army);
        this.platoons.set(armyInfo.platoons);
        this.library = armyInfo.library;
      }),
      tap(r => this.loading.set(false)),
      takeUntil(this._unsubscribeAll$)
    ).subscribe();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll$.next();
    this._unsubscribeAll$.complete();
  }

  ngAfterViewInit() {
    this.expansionPanels.changes.pipe(
      takeUntil(this._unsubscribeAll$)
    ).subscribe(r => {
      // Expand the last added panel when the list of panels changes
      const lastPanel = this.expansionPanels.last;
      if (!this.pendingAdd) return;
      if (lastPanel) {
        this._ngZone.runOutsideAngular(() => {
          setTimeout(() => lastPanel.open(), 0); // Defer the operation with setTimeout
        });
      }
      this.pendingAdd = false;
    });
  }

  delete() {
    const id = this.army()?.id;
    if (!id ) return;
    this._confirmationService.confirm('Are you sure you want to delete this army?', 'Delete Army', () => {
      this.loading.set(true);
      this._armyService.delete(id)
      .then(() => this._router.navigate(['../'], { relativeTo: this._route }))
      .catch(e => console.log(e))
      .finally(() => this.loading.set(false));
    }, true);
  }

  save(closeAfter: boolean) {
    const army = this.army()!;
    const platoons = this.platoons();
    this.saving.set(closeAfter ? 'saveAndClose' : 'saveOnly');
    this._armyService.updateArmyAndPlatoons(army, platoons).then(() => {
      if (closeAfter) this._router.navigate(['../'], { relativeTo: this._route });
      else this._snackbar.open('Successfully Saved Army', 'Dismiss', {duration: 3000});
    }).catch(e => this.error = e).finally(() => this.saving.set(false));
  }

  addPlatoon(selector: PlatoonSelector) {
    const newPlatoon = new Platoon({
      selectorId: selector.id
    }, this.library);
    this.platoons.update((platoons) => [...platoons, newPlatoon]);
    this.pendingAdd = true;
  }

  copyPlatoon(index: number) {
    const existingPlatoon = this.platoons()[index];
    const model = existingPlatoon.toStoredObject();
    model.id = generateGuid();
    const newPlatoon = new Platoon(model, this.library);

    const updatedPlatoons = [...this.platoons()];
    updatedPlatoons.splice(index + 1, 0, newPlatoon);

    this.platoons.set(updatedPlatoons);
  }

  deletePlatoon(index: number): void {
    this._confirmationService.confirm('Are you sure you want to delete this platoon?', 'Delete', () => {
      this.platoons.update((platoons) => platoons.filter((_, i) => i !== index));
    }, true);
  }

  drop(event: CdkDragDrop<Platoon[]>) {
    this.platoons.update((platoons) => {
      moveItemInArray(platoons, event.previousIndex, event.currentIndex);
      return platoons; // Ensure the updated array is returned for the signal to react
    });
  }

  expandAll() {
    this.multiExpand.set(true);
    this.expansionAccordions.forEach(p => {
      p.multi = true;
      p.openAll()
    });
  }

  collapseAll() {
    this.multiExpand.set(false);
    this.expansionAccordions.forEach(p => p.closeAll());
  }

  showError(e: any | FirestoreError) {
    console.log(e);
    if (e instanceof FirestoreError) this.error = e.message;
    else this.error = e;
  }

}
