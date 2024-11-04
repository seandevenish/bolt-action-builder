import { Inject, Injectable, InjectionToken } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { IIconPack } from './icon-pack.interface';

export const ICONPACK_CONFIG_TOKEN = new InjectionToken<IIconPack>('ICONPACK_CONFIG_TOKEN');

@Injectable({ providedIn: 'root' })
export class IconService {
    private static _registeredPacks: IIconPack[] = [];

    private _iconsUrl = '../assets/icons/';

    constructor(@Inject(ICONPACK_CONFIG_TOKEN) private _iconPacks: IIconPack[],
        private _matIconRegistry: MatIconRegistry,
        private _domSanitizer: DomSanitizer) {
    }

    public registerIconPacks() {
        this._iconPacks.filter(ip => !IconService._registeredPacks.includes(ip)).forEach(pack => {
            this.registerIconPack(pack);
            IconService._registeredPacks.push(pack);
        });
    }

    public registerIconPack(pack: IIconPack) {
        if (!pack.icons || !pack.icons.length) {
            throw new Error('IconPack could not be empty!');
        }

        const folder = `${this._iconsUrl}${pack.name}`;

        pack.icons.forEach(iconName => {
            const iconUrl = this._domSanitizer.bypassSecurityTrustResourceUrl(`${folder}/${iconName}.svg`);

            this._matIconRegistry.addSvgIconInNamespace(pack.name, iconName, iconUrl);
        });
    }
}
