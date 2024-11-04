import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Army } from '../army.class';
import { CommonModule, DatePipe, DecimalPipe, NgFor } from '@angular/common';
import { ArmyCardComponent } from '../army-card/army-card.component';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { ArmyFormComponent } from '../army-form/army-form.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, Subject, takeUntil, tap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { ArmyService } from '../army.service';
import { RouterLink } from '@angular/router';
import { Faction } from '../../faction';

@Component({
  selector: 'app-armies-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatInputModule, MatProgressBarModule, MatListModule, NgFor, DatePipe, ArmyCardComponent, ReactiveFormsModule, CommonModule, DecimalPipe],
  templateUrl: './armies-list.component.html',
  styleUrl: './armies-list.component.scss',
})
export class ArmiesListComponent implements OnInit, OnDestroy {

  private groupedArmies: { faction: Faction; armies: Army[] }[] = [];
  filteredGroupedArmies: { faction: Faction; armies: Army[] }[] = [];

  search = new FormControl<string|null>(null);

  loading = signal(false);
  error: any;
  private readonly _unsubscribeAll$ = new Subject<void>();


  constructor(private dialog: MatDialog,
    private _armyService: ArmyService
  ) {
  }

  ngOnInit(): void {
    this.loadArmies();
    this.search.valueChanges.pipe(debounceTime(300), takeUntil(this._unsubscribeAll$)).subscribe((searchTerm) => {
      this.filterArmies(searchTerm);
    });
  }

  private loadArmies() {
    this.loading.set(true);
    this._armyService.getAll().then(a => {
      this.groupArmiesByFaction(a);
      this.filteredGroupedArmies = this.groupedArmies; // Initially display all armies
    }).catch(e => this.error = e).finally(() => this.loading.set(false));
  }

  ngOnDestroy(): void {
    this._unsubscribeAll$.next();
    this._unsubscribeAll$.complete();
  }

  filterArmies(searchTerm: string | null) {

    if (!searchTerm) {
      this.filteredGroupedArmies = this.groupedArmies;
      return;
    }

    try {
      const lowerCaseTerm = searchTerm.toLowerCase();
      this.filteredGroupedArmies = this.groupedArmies
        .map((group) => ({
          faction: group.faction,
          armies: group.armies.filter((army) => army.name.toLowerCase().includes(lowerCaseTerm)),
        }))
        .filter((group) => group.armies.length > 0); // Remove empty groups
    }
    catch(e) {
      console.log('error searching', e);
      this.filteredGroupedArmies = this.groupedArmies;
    }

  }

  newArmy(): void {
    const dialogRef = this.dialog.open(ArmyFormComponent, {
      panelClass: 'app-dialog-container',
      data: {
        id: 'add',
        army: {},
      },
    });
    dialogRef
      .afterClosed()
      .subscribe((result: any|undefined) => {
        if (!result) {
          return;
        }
        // open army here
        this.loadArmies();
      });
  }

  editArmy(army: Army): void {
    const dialogRef = this.dialog.open(ArmyFormComponent, {
      panelClass: 'app-dialog-container',
      data: {
        id: army.id,
        army: army,
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

  private groupArmiesByFaction(armies: Army[]): void {
    const armyMap = new Map<string, { faction: Faction; armies: Army[] }>();

    // Group armies by faction
    armies.forEach((army) => {
      if (army.faction) {
        const factionId = army.faction.id;
        if (!armyMap.has(factionId)) {
          armyMap.set(factionId, { faction: army.faction, armies: [] });
        }
        armyMap.get(factionId)?.armies.push(army);
      }
    });

    // Convert the map to an array, sort factions by name
    this.groupedArmies = Array.from(armyMap.values()).sort((a, b) =>
      a.faction.name.localeCompare(b.faction.name)
    );

    // Sort armies within each faction by name, and then by modified date if names are equal
    this.groupedArmies.forEach(group => {
      group.armies.sort((a, b) => {
        // First, sort by name
        const nameComparison = a.name.localeCompare(b.name);
        if (nameComparison !== 0) {
          return nameComparison; // If names are different, use name comparison
        }

        // Then, sort by modifiedDate (nulls go to the bottom)
        if (a.modifiedDate === null && b.modifiedDate === null) {
          return 0; // Both null, consider them equal
        }
        if (a.modifiedDate === null) {
          return 1; // a is null, so it should come after b
        }
        if (b.modifiedDate === null) {
          return -1; // b is null, so a should come before b
        }

        // Both have non-null dates, compare by descending order of modifiedDate
        return new Date(b.modifiedDate!).getTime() - new Date(a.modifiedDate!).getTime();
      });
    });
  }

}
