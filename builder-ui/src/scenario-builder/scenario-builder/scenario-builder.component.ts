import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-scenario-builder',
  templateUrl: './scenario-builder.component.html',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./scenario-builder.component.scss']
})
export class ScenarioBuilderComponent {
  victoryConditions = [
    { roll: 1, name: 'Seek and Destroy', summary: 'Inflict maximum damage. Score 1 point per destroyed enemy unit. Win by 2 points.' },
    { roll: 2, name: 'Key Positions', summary: 'Control objectives placed on the battlefield (D3+4 objectives). Capture objectives throughout the game by moving with 3", highest number of objectives wins.' },
    { roll: 3, name: 'Breakthrough', summary: 'Move units off the enemy\'s deployment edge. Score 1 point for units in the enemy zone and 3 points for units moved off the table. Win by 2 points.' },
    { roll: 4, name: 'Top Secret', summary: 'Retrieve a briefcase marker placed in the center of the table and carry it off your deployment edge.' },
    { roll: 5, name: 'Demolition', summary: 'Destroy the enemy base by moving a unit within 3" and rolling 4+ at the end of a turn.' },
    { roll: 6, name: 'Hold Until Relieved', summary: 'Control a single central objective marker (unit with 3") at the end of the game.' }
  ];

  deploymentZones = [
    { roll: [1, 2, 3], name: 'Long Edges', summary: 'Each player deploys along opposite long table edges, zone extends 12" from table edge. Players roll to pick the first edge.' },
    { roll: [4, 5, 6], name: 'Quarters', summary: 'The table is divided into quarters. Players roll to pick quarters as their deployment zones. All zones exclude 12" from centre of table.' }
  ];

  deploymentTypes = [
    { roll: [1, 2, 3], name: 'Meeting Engagement', summary: 'No units deployed at start of the game, first wave enters during Turn 1. Up to half of the units can be left in reserve.' },
    { roll: [4, 5], name: 'Prepared Positions', summary: 'Units not in reserve are deployed on the table prior to Turn 1 (using order dice from bag). Up to half of the units can be left in reserve.' },
    { roll: [6], name: 'Fog of War', summary: 'Units not in reserve are deployed on the table prior to Turn 1 (using order dice from bag). No flanking is allowed, and reserves can enter from any edge. At least half of the units must be left in reserve.' }
  ];

  // Selected scenario properties
  selectedVictoryCondition: any;
  selectedDeploymentZone: any;
  selectedDeploymentType: any;

  generated = false;

  // Generate a random scenario
  generateScenario() {
    this.generated = true;
    this.selectedVictoryCondition = this.getRandomElement(this.victoryConditions);
    this.selectedDeploymentZone = this.getRandomElement(this.deploymentZones);
    this.selectedDeploymentType = this.getRandomElement(this.deploymentTypes);
  }

  private getRandomElement(array: any[]): any {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
  }
}
