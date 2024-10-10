import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PlatoonSelector } from './platoon-selector.class';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlatoonSelectorRepositoryService {

  private readonly coreConfigUrl = 'assets/army-config/platoons/core/core-platoons.json';
  private readonly factionConfigUrlTemplate = `${this.coreConfigUrl}/factions/`; // Base path for faction-specific JSON

  constructor(private readonly http: HttpClient) {}

  /**
   * Fetches the core platoons and faction-specific platoons from their respective JSON files.
   * @param faction The faction name to load specific platoons for. This will be expanded to include other properties that identify the force selector in question
   * @returns An Observable of PlatoonSelector[] combining core and faction-specific platoons.
   */
  getPlatoonsForForceSelector(faction: string): Observable<PlatoonSelector[]> {
    const factionConfigUrl = `${this.factionConfigUrlTemplate}${faction}-platoons.json`;

    return forkJoin({
      corePlatoons: this.loadPlatoonsFromFile(this.coreConfigUrl),
      factionPlatoons: this.loadPlatoonsFromFile(factionConfigUrl).pipe(
        catchError(error => {
          console.error(`No definition for faction '${faction}':`, error);
          return of([]); // Fallback to an empty list if the faction file is missing or fails to load
        })
      )
    }).pipe(
      map(({ corePlatoons, factionPlatoons }) => [...corePlatoons, ...factionPlatoons])
    );
  }

  /**
   * Loads platoons from a specific JSON file.
   * @param url The URL of the JSON file to load.
   * @returns An Observable of PlatoonSelector[].
   */
  private loadPlatoonsFromFile(url: string): Observable<PlatoonSelector[]> {
    return this.http.get<{ platoons: any[] }>(url).pipe(
      map(data => data.platoons.map(platoon => new PlatoonSelector(
        platoon.id,
        platoon.name,
        platoon.category,
        platoon.unitRequirements
      )))
    );
  }
}
