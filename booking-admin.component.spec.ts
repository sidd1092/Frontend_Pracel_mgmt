import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookinAdminComponent } from './booking-admin.component';

describe('BookinAdminComponent', () => {
  let component: BookinAdminComponent;
  let fixture: ComponentFixture<BookinAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookinAdminComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BookinAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
