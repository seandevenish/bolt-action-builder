import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArmiesListComponent } from './armies-list.component';

describe('ArmiesListComponent', () => {
  let component: ArmiesListComponent;
  let fixture: ComponentFixture<ArmiesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArmiesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArmiesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
