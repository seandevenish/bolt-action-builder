import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { Weapon } from './weapon.interface';

@Injectable({
  providedIn: 'root'
})
export class WeaponRepositoryService {

  private readonly weaponConfigUrl = 'assets/army-config/weapons/core-weapons.json';

  constructor(private readonly http: HttpClient) {}

  /**
   * Fetches the list of weapons from the JSON file.
   * @returns An Observable of Weapon[] containing the global set of weapons.
   */
  getWeapons(): Observable<Weapon[]> {
    return this.http.get<{ weapons: any[] }>(this.weaponConfigUrl).pipe(
      map(data => data.weapons.map(weapon => ({
        id: weapon.id,
        name: weapon.name,
        penetrationValue: weapon.penetrationValue,
        hits: weapon.hits,
        range: weapon.range,
        minIndirectRange: weapon.minIndirectRange,
        maxIndirectRange: weapon.maxIndirectRange,
        shots: weapon.shots,
        specialRuleIds: weapon.specialRuleIds,
        heDiameter: weapon.heDiameter
      }) as Weapon)),
      catchError(error => {
        console.error('Failed to load weapons:', error);
        return of([]); // Fallback to an empty list if the file fails to load
      })
    );
  }
}
