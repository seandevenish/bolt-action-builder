import { AfterViewInit, Component, NgZone, OnDestroy, OnInit, QueryList, signal, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { from, map, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAccordion, MatExpansionModule, MatExpansionPanel } from '@angular/material/expansion'
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ConfirmationService } from '../../../app/services/confirmation.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { factionLibrary } from '../../faction';
import { PlatoonSelectorRepositoryService } from '../../platoons/platoon-selector-repository.service';
import { PlatoonSelector } from '../../platoons/platoon-selector.class';
import { Platoon } from '../../platoons/platoon.class';
import { PlatoonComponent } from '../../platoons/platoon/platoon.component';
import { Army } from '../army.class';
import { ArmyService } from '../army.service';

@Component({
  selector: 'app-army-root',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, MatButtonModule, MatIconModule, MatMenuModule, MatToolbarModule, MatTooltipModule, MatExpansionModule, PlatoonComponent, DragDropModule],
  templateUrl: './army-root.component.html',
  styleUrl: './army-root.component.scss'
})
export class ArmyRootComponent implements OnInit, OnDestroy, AfterViewInit {

  army = signal<Army|null>(null);
  platoons = signal<Platoon[]>([]);
  loading = signal(false);
  pendingAdd = false;

  multiExpand = signal(false);

  platoonSelectors: PlatoonSelector[] = [];

  private readonly _unsubscribeAll$ = new Subject<void>();

  @ViewChildren(MatAccordion) expansionAccordions!: QueryList<MatAccordion>;
  @ViewChildren('platoonPanel') expansionPanels!: QueryList<MatExpansionPanel>;

  constructor(private readonly _armyService: ArmyService,
    private readonly _platoonSelectorService: PlatoonSelectorRepositoryService,
    private readonly _route: ActivatedRoute,
    private readonly _router: Router,
    private readonly _confirmationService: ConfirmationService,
    private readonly _ngZone: NgZone
  ) {

  }

  ngOnInit(): void {
    this._route.paramMap.pipe(
      map(p => p.get('armyId') as string),
      tap(p => this.loading.set(true)),
      switchMap(r => this.loadArmy(r)),
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

  private loadArmy(id: string) {
    return from(this._armyService.get(id)).pipe(
      map(a => new Army(a, factionLibrary)),
      tap(a => this.army.set(a)),
      switchMap(army =>
        from(this._armyService.getPlatoonsForArmy(army.id)).pipe(
          tap(platoons => this.platoons.set(platoons)),
          map(() => army)
        )
      ),
      switchMap(army =>
        this._platoonSelectorService.getPlatoonsForForceSelector(army.factionId).pipe(
          tap(platoonSelectors => {
            this.platoonSelectors = platoonSelectors;
            this.platoons().forEach(p => p.assignSelector(platoonSelectors));
          })
        )
      )
    );
  }

  delete() {
    const id = this.army()?.id;
    if (!id ) return;
    this._confirmationService.confirm('Are you sure you want to delete this army?', () => {
      this.loading.set(true);
      this._armyService.delete(id)
      .then(() => this._router.navigate(['../'], { relativeTo: this._route }))
      .catch(e => console.log(e))
      .finally(() => this.loading.set(false));
    }, true);
  }

  save() {
    const army = this.army()!;
    const platoons = this.platoons();
    this._armyService.updateArmyAndPlatoons(army, platoons);
  }

  addPlatoon(selector: PlatoonSelector) {
    const newPlatoon = new Platoon({}, selector);
    this.platoons.update((platoons) => [...platoons, newPlatoon]);
    this.pendingAdd = true;
  }

  deletePlatoon(index: number): void {
    this._confirmationService.confirm('Are you sure you want to delete this platoon?', () => {
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

}
