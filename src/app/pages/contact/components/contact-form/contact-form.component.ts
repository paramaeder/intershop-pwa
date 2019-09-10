import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { FeatureToggleService } from 'ish-core/feature-toggle.module';
import { Contact } from 'ish-core/models/contact/contact.model';
import { SelectOption } from 'ish-shared/forms/components/select/select.component';
import { markAsDirtyRecursive } from 'ish-shared/forms/utils/form-utils';

/**
 * The Contact Form Component show the customer a form to contact the shop
 *
 * @example
 * <ish-contact-form [subjects]="contactSubjects" (request)="sendRequest($event)"></ish-contact-form>
 */
@Component({
  selector: 'ish-contact-form',
  templateUrl: './contact-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactFormComponent implements OnChanges, OnInit {
  /** Possible subjects to show to the customer in a select box. */
  @Input() subjects: string[] = [];
  /** The contact request to send. */
  @Output() request = new EventEmitter<{ contact: Contact; captcha?: string }>();

  subjectOptions: SelectOption[];

  /** The form for customer message to the shop. */
  contactForm: FormGroup;
  submitted = false;

  constructor(private fb: FormBuilder, private featureToggle: FeatureToggleService) {}

  ngOnInit() {
    this.initForm();
  }

  ngOnChanges() {
    this.subjectOptions = this.mapSubjectOptions(this.subjects);
  }

  /** emit contact request, when for is valid or mark form as dirty, when form is invalid */
  submitForm() {
    if (this.contactForm.valid) {
      const formValue = this.contactForm.value;
      const contact: Contact = {
        name: formValue.name,
        email: formValue.email,
        phone: formValue.phone,
        subject: formValue.subject,
        comment: formValue.comments,
        order: formValue.order,
      };

      this.featureToggle.enabled('captcha')
        ? this.request.emit({ contact, captcha: formValue.captcha })
        : this.request.emit({ contact });
    } else {
      markAsDirtyRecursive(this.contactForm);
      this.submitted = true;
    }
  }

  /** map subjects to select box options */
  private mapSubjectOptions(subjects: string[]): SelectOption[] {
    const options: SelectOption[] = [];
    subjects.map(subject => options.push({ value: subject, label: subject }));
    return options;
  }

  private initForm() {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      order: [''],
      subject: ['', Validators.required],
      comments: ['', Validators.required],
      captcha: this.featureToggle.enabled('captcha') ? ['', [Validators.required]] : [''],
    });
  }

  /** return boolean to set submit button enabled/disabled */
  get formDisabled(): boolean {
    return this.contactForm.invalid && this.submitted;
  }
}
