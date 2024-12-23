import { Platoon } from './../../platoons/platoon.class';
import { AfterViewInit, Component, NgZone, OnDestroy, OnInit, QueryList, Signal, signal, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, combineLatest, EMPTY, finalize, from, map, Observable, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
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
import { PlatoonComponent } from '../../platoons/platoon/platoon.component';
import { Army } from '../army.class';
import { ArmyService } from '../army.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FirestoreError } from 'firebase/firestore';
import { Library } from '../../units/library.interface';
import { generateGuid } from '../../../app/utilities/guid';
import { IconComponent } from '../../../app/components/icon';
import { MatDialog } from '@angular/material/dialog';
import { ArmyFormComponent } from '../army-form/army-form.component';
import { ForceService } from '../../forces/force.service';
import { Force } from '../../forces/force.class';
import { SpinnerComponent } from '../../../app/components/spinner/spinner.component';
import { ArmyPdfService } from '../army-pdf.service';

@Component({
  selector: 'app-army-root',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, MatButtonModule, MatProgressSpinnerModule, MatIconModule, MatMenuModule, MatToolbarModule, MatTooltipModule, MatExpansionModule, PlatoonComponent, DragDropModule, IconComponent, SpinnerComponent],
  templateUrl: './army-root.component.html',
  styleUrl: './army-root.component.scss'
})
export class ArmyRootComponent implements OnInit, OnDestroy, AfterViewInit {

  error: any;

  force: Force | null = null;
  loading = signal(false);
  saving = signal<false|'saveOnly'|'saveAndClose'>(false);
  pendingAdd = false;

  multiExpand = signal(false);

  library!: Library;

  private readonly _unsubscribeAll$ = new Subject<void>();

  @ViewChildren(MatAccordion) expansionAccordions!: QueryList<MatAccordion>;
  @ViewChildren('platoonPanel') expansionPanels!: QueryList<MatExpansionPanel>;

  constructor(private readonly _armyService: ArmyService,
    private readonly _forceService: ForceService,
    private readonly _route: ActivatedRoute,
    private readonly _router: Router,
    private readonly _confirmationService: ConfirmationService,
    private readonly _ngZone: NgZone,
    private readonly _snackbar: MatSnackBar,
    private readonly _dialog: MatDialog,
    private readonly _armyPdfService: ArmyPdfService
  ) {

  }

  ngOnInit(): void {
    this._route.paramMap.pipe(
      map(p => p.get('armyId') as string),
      tap(p => this.loading.set(true)),
      switchMap(armyId => this.getArmy(armyId).pipe(
        switchMap(r => this._forceService.getForce(r)),
        catchError(e => {
          this.showError(e);
          this.loading.set(false);
          return EMPTY;
        }),
        finalize(() => this.loading.set(false))
      )),
      tap((force: Force) => {
        this.force = force;
        this.library = force.library;
      }),
      tap(r => this.loading.set(false)),
      takeUntil(this._unsubscribeAll$)
    ).subscribe();
  }

  getArmy(armyId: string): Observable<Army> {
    return from(this._armyService.get(armyId));
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
    const id = this.force?.army.id;
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
    const army = this.force!.army;
    const platoons = this.force!.platoons$.getValue();
    army.points = this.force!.cost;
    this.saving.set(closeAfter ? 'saveAndClose' : 'saveOnly');
    this._armyService.updateArmyAndPlatoons(army, platoons).then(() => {
      if (closeAfter) this._router.navigate(['../'], { relativeTo: this._route });
      else this._snackbar.open('Successfully Saved Army', 'Dismiss', {duration: 3000});
    }).catch(e => this.error = e).finally(() => this.saving.set(false));
  }

  exportPdf() {
    this._armyPdfService.generateArmySummaryPDF(this.force!, this.force!.army.name);
  }

  editArmyDetails() {
    const army = this.force?.army as Army;
    const dialogRef = this._dialog.open(ArmyFormComponent, {
      panelClass: 'app-dialog-container',
      data: {
        id: army.id,
        army: army,
      },
    });
    dialogRef
      .afterClosed()
      .subscribe((result: Army|null) => {
        if (result) Object.assign(this.force!.army, result);
      });
  }

  addPlatoon(selector: PlatoonSelector) {
    const newPlatoon = new Platoon({
      selectorId: selector.id
    }, this.library);
    this.force!.addPlatoon(newPlatoon);
    this.pendingAdd = true;
  }

  copyPlatoon(index: number) {
    const existingPlatoon = this.force?.platoons$.getValue()[index];
    if (!existingPlatoon) return;
    const model = existingPlatoon.toStoredObject();
    model.id = generateGuid();
    const newPlatoon = new Platoon(model, this.library);

    this.force?.addPlatoon(newPlatoon, index + 1);
  }

  deletePlatoon(index: number): void {
    this._confirmationService.confirm('Are you sure you want to delete this platoon?', 'Delete', () => {
      this.force!.deletePlatoon(index);
    }, true);
  }

  drop(event: CdkDragDrop<Platoon[] | null>) {
    this.force?.reorderPlatoon(event.previousIndex, event.currentIndex);
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
