import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MockComponent } from 'ng-mocks';

import { coreReducers } from 'ish-core/store/core-store.module';
import { ngrxTesting } from 'ish-core/utils/dev/ngrx-testing';
import { BreadcrumbComponent } from 'ish-shared/common/components/breadcrumb/breadcrumb.component';
import { LoadingComponent } from 'ish-shared/common/components/loading/loading.component';

import { ContactConfirmationComponent } from './components/contact-confirmation/contact-confirmation.component';
import { ContactFormComponent } from './components/contact-form/contact-form.component';
import { ContactPageContainerComponent } from './contact-page.container';

describe('Contact Page Container', () => {
  let component: ContactPageContainerComponent;
  let fixture: ComponentFixture<ContactPageContainerComponent>;
  let element: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), ngrxTesting({ reducers: coreReducers })],
      declarations: [
        ContactPageContainerComponent,
        MockComponent(BreadcrumbComponent),
        MockComponent(ContactConfirmationComponent),
        MockComponent(ContactFormComponent),
        MockComponent(LoadingComponent),
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactPageContainerComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
    expect(element).toBeTruthy();
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
