import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorPageComponent } from './error-page.component';

describe('Error Page Component', () => {
  let fixture: ComponentFixture<ErrorPageComponent>;
  let element: HTMLElement;
  let component: ErrorPageComponent;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [ErrorPageComponent],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorPageComponent);
    element = fixture.nativeElement;
    component = fixture.componentInstance;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
    expect(element).toBeTruthy();
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should render error content on the HTML', () => {
    expect(element.getElementsByTagName('h3')[0].textContent).toContain('We are sorry');
    expect(element.getElementsByTagName('p')[0].textContent).toContain(
      'The page you are looking for is currently not available'
    );
    expect(element.getElementsByTagName('h4')[0].textContent).toContain('Please try one of the following:');
    expect(element.getElementsByClassName('btn-primary')[0].textContent).toContain('Search');
  });
});
