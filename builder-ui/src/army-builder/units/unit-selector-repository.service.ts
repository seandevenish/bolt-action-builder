import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UnitSelector, VehicleSelector } from './unit-selector.class';
import { InfantryUnitSelector } from './infantry-unit-selector.class';
import { catchError, map, Observable, of, forkJoin } from 'rxjs';
import { TeamUnitSelector } from './team-unit-selector.class';

@Injectable({
  providedIn: 'root'
})
export class UnitSelectorRepositoryService {

  private readonly coreConfigUrl = 'assets/army-config/units/core/core-units.json';
  private readonly factionConfigUrlTemplate = 'assets/army-config/units'; // Base path for faction-specific JSON

  constructor(private readonly http: HttpClient) {}

  /**
   * Fetches core unit selectors and faction-specific unit selectors from JSON files.
   * This method loads infantry, vehicle, and team units separately for a given faction.
   * @param faction The faction name to load specific unit selectors for.
   * @returns An Observable of UnitSelector[] combining core and faction-specific unit selectors.
   */
  getUnitsForFaction(faction: string, forceSelectorId: string): Observable<UnitSelector[]> {
    const factionUrl = `${this.factionConfigUrlTemplate}/${faction.toLowerCase()}`;
    const infantryUrl = `${factionUrl}/${faction.toLowerCase()}-infantry-units.json`;
    const vehicleUrl = `${factionUrl}/${faction.toLowerCase()}-vehicle-units.json`;
    const teamUrl = `${factionUrl}/${faction.toLowerCase()}-team-units.json`;

    return forkJoin({
      coreUnits: of([]),//this.loadUnitsFromFile(this.coreConfigUrl),
      infantryUnits: this.loadUnitsFromFile(infantryUrl, 'infantry').pipe(
        catchError(error => {
          console.error(`No infantry definition for faction '${faction}':`, error);
          return of([]); // Fallback to an empty list if infantry file is missing or fails to load
        })
      ),
      vehicleUnits: this.loadUnitsFromFile(vehicleUrl, 'vehicle').pipe(
        catchError(error => {
          console.error(`No vehicle definition for faction '${faction}':`, error);
          return of([]); // Fallback to an empty list if vehicle file is missing or fails to load
        })
      ),
      teamUnits: this.loadUnitsFromFile(teamUrl, 'team').pipe(
        catchError(error => {
          console.error(`No team definition for faction '${faction}':`, error);
          return of([]); // Fallback to an empty list if team file is missing or fails to load
        })
      )
    }).pipe(
      map(({ coreUnits, infantryUnits, vehicleUnits, teamUnits }) => [
        ...coreUnits,
        ...infantryUnits,
        ...vehicleUnits,
        ...teamUnits
      ])
    );
  }

  /**
   * Loads unit selectors from a specific JSON file.
   * @param url The URL of the JSON file to load.
   * @returns An Observable of UnitSelector[].
   */
  private loadUnitsFromFile(url: string, selectorType: 'infantry' | 'vehicle' | 'team'): Observable<UnitSelector[]> {
    return this.http.get<{ units: any[] }>(url).pipe(
      map(data => data.units.map(unit => this.createUnitSelector(unit, selectorType)))
    );
  }

  /**
   * Creates the appropriate UnitSelector instance based on the unit type.
   * @param unit The raw unit data from the JSON file.
   * @returns A UnitSelector instance (e.g., InfantryUnitSelector, VehicleSelector).
   */
  private createUnitSelector(unit: any, selectorType: 'infantry' | 'vehicle' | 'team'): UnitSelector {
    switch (selectorType) {
      case 'infantry':
        return new InfantryUnitSelector(unit);
      case 'vehicle':
        return new VehicleSelector(unit);
      case 'team':
        return new TeamUnitSelector(unit);
      default:
        return new UnitSelector(unit);
    }
  }
}
