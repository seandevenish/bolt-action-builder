import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PlatoonSelector } from './platoon-selector.class';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlatoonSelectorRepositoryService {

  private readonly baseUrl = 'assets/army-config/platoons';
  private readonly coreConfigUrl = `${this.baseUrl}/core/core-platoons.json`;
  private readonly factionConfigUrlTemplate = `${this.baseUrl}/factions`; // Base path for faction-specific JSON

  constructor(private readonly http: HttpClient) {}

  /**
   * Fetches the core platoons and faction-specific platoons from their respective JSON files.
   * @param faction The faction name to load specific platoons for. This will be expanded to include other properties that identify the force selector in question
   * @returns An Observable of PlatoonSelector[] combining core and faction-specific platoons.
   */
  getPlatoonsForForceSelector(faction: string, forceSelectorId: string): Observable<PlatoonSelector[]> {
    const factionConfigUrl = `${this.factionConfigUrlTemplate}/${faction.toLowerCase()}-platoons.json`;

    return forkJoin({
      corePlatoons: this.loadPlatoonsFromFile(this.coreConfigUrl),
      factionPlatoons: this.loadPlatoonsFromFile(factionConfigUrl).pipe(
        catchError(error => {
          console.error(`No definition for faction '${faction}':`, error);
          return of([]); // Fallback to an empty list if the faction file is missing or fails to load
        })
      )
    }).pipe(
      map(({ corePlatoons, factionPlatoons }) => {
        // Create a map of faction platoons by ID for quick lookup
        const factionPlatoonMap = new Map(
          factionPlatoons.map(platoon => [platoon.id, platoon])
        );

        // For each core platoon, either keep it or replace with faction version
        const mergedPlatoons = corePlatoons.map(corePlatoon =>
          factionPlatoonMap.get(corePlatoon.id) || corePlatoon
        );

        // Add any remaining faction platoons that don't override core ones
        factionPlatoons.forEach(factionPlatoon => {
          if (!mergedPlatoons.some(p => p.id === factionPlatoon.id)) {
            mergedPlatoons.push(factionPlatoon);
          }
        });

        return mergedPlatoons;
      })
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
