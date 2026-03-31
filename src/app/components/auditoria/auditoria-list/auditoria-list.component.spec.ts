import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditoriaListComponent } from './auditoria-list.component';

describe('AuditoriaListComponent', () => {
  let component: AuditoriaListComponent;
  let fixture: ComponentFixture<AuditoriaListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditoriaListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AuditoriaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
