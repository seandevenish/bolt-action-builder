import { Component, OnInit, signal } from '@angular/core';
import { ArmyService } from '../../army.service';
import { ActivatedRoute, Router } from '@angular/router';
import { from, map, switchMap, tap } from 'rxjs';
import { Army } from '../../army.class';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ConfirmationService } from '../../../app/services/confirmation.service';

@Component({
  selector: 'app-army-root',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: './army-root.component.html',
  styleUrl: './army-root.component.scss'
})
export class ArmyRootComponent implements OnInit {

  army = signal<Army|null>(null);
  loading = signal(false);

  constructor(private readonly _armyService: ArmyService,
    private readonly _route: ActivatedRoute,
    private readonly _router: Router,
    private readonly _confirmationService: ConfirmationService
  ) {

  }

  ngOnInit(): void {
    this._route.paramMap.pipe(
      map(p => p.get('armyId') as string),
      tap(p => this.loading.set(true)),
      switchMap(r => from(this._armyService.get(r))),
      tap(r => this.army.set(r)),
      tap(r => this.loading.set(false))
    ).subscribe();
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

}
