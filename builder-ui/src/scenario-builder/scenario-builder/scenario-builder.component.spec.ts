import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScenarioBuilderComponent } from './scenario-builder.component';

describe('ScenarioBuilderComponent', () => {
  let component: ScenarioBuilderComponent;
  let fixture: ComponentFixture<ScenarioBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScenarioBuilderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScenarioBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
