import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentsNotPayComponent } from './students-not-pay.component';

describe('StudentsNotPayComponent', () => {
  let component: StudentsNotPayComponent;
  let fixture: ComponentFixture<StudentsNotPayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentsNotPayComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StudentsNotPayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
