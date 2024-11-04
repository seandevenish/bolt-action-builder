import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-icon',
    styleUrls: ['./icon.component.scss'],
    templateUrl: './icon.component.html',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatIconModule]
})

export class IconComponent {
    @Input('pack')
    public pack!: string;

    @Input('icon')
    public set icon(value: string) {
        this._iconName = value;

        const pack = this.pack ? `${this.pack}:` : '';

        this.defaultIcon = null;
        this.iconWithPack = '';

        if (pack) {
            this.iconWithPack = `${pack}${value}`;
            return;
        }

        this.defaultIcon = this._iconName;
    }

    @Input('color')
    public color: string | null = null;

    @Input('rotate')
    public rotate: string | null = null;

    @Input('size')
    public size: 'xs' | 'sm' | 'ms' | 'md' | 'lg' | 'xl' | number | null = 'md';

    public get fontSize() {
      if (typeof this.size === 'string') {
        switch (this.size) {
            case 'xs': return 0.8;
            case 'sm': return 1;
            case 'ms': return 1.15;
            case 'md': return 1.35;
            case 'lg': return 1.6;
            case 'xl': return 2;
        }
      }
      return this.size;

    }

    @HostBinding('style.line-height')
    public get lineHeight() {
        return this.fontSize ? `${this.fontSize}rem` : '';
    }

    public get iconFontSize() {
        return this.pack ? '' : `${this.fontSize}rem`;
    }

    private _iconName: string | null = null;
    public defaultIcon: string | null = null;
    public iconWithPack: string = '';

    public get classes(): string {
        const colorClass = this.color ? `color-${this.color}` : '';
        const rotateClass = this.rotate ? `rotate-${this.rotate}` : '';

        return `${colorClass} ${rotateClass}`;
    }
}
