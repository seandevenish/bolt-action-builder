import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlatoonComponent } from './platoon.component';

describe('PlatoonComponent', () => {
  let component: PlatoonComponent;
  let fixture: ComponentFixture<PlatoonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlatoonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlatoonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
