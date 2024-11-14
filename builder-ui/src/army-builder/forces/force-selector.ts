export class ForceSelector {
  readonly id: string;
  readonly platoonSelectorIds: string[];
  readonly factionIds: string[];
  readonly infantryMinRequirement: boolean = true;

  constructor(id: string, platoonSelectorIds: string[], factionIds: string[], infantryMinRequirement: boolean = true) {
    this.id = id;
    this.platoonSelectorIds = platoonSelectorIds;
    this.factionIds = factionIds;
    this.infantryMinRequirement = infantryMinRequirement;
  }
}
