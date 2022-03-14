import { Inject, Injectable } from '@angular/core';
import { PaymentInstrument } from '@intershop-pwa/checkout/payment/payment-method-base/models/payment-instrument.model';
import { PaymentMethod } from '@intershop-pwa/checkout/payment/payment-method-base/models/payment-method.model';
import {
  PAYMENT_METHOD_CALLBACK,
  PaymentMethodCallback,
} from '@intershop-pwa/checkout/payment/payment-method-base/payment-method.callback.interface';
import { PaymentMethodConfiguration } from '@intershop-pwa/checkout/payment/payment-method-base/payment-method.interface';
import { FormlyFieldConfig } from '@ngx-formly/core';

@Injectable()
export class DefaultPaymentMethodConfigurationComponent implements PaymentMethodConfiguration {
  constructor(@Inject(PAYMENT_METHOD_CALLBACK) private paymentMethodCallbacks: PaymentMethodCallback[]) {}
  id = 'DEFAULT';
  getFormlyFieldConfig(paymentMethod: PaymentMethod): FormlyFieldConfig {
    if (!paymentMethod.parameters && !paymentMethod.isRestricted) {
      return {
        type: 'ish-radio-field',
        key: 'paymentMethodSelect',
        wrappers: ['ish-payment-method-wrapper', 'form-field-checkbox-horizontal'],
        templateOptions: {
          paymentMethod,
          label: 'checkout.payment.payWith.link',
          args: { '0': paymentMethod.displayName },
          inputClass: 'form-check-input',
          value: paymentMethod.id,
        },
      };
    }

    if (paymentMethod.parameters?.length && paymentMethod.paymentInstruments?.length) {
      const parameters: FormlyFieldConfig[] = [];
      paymentMethod.parameters.forEach(param => parameters.push({ ...param }));

      return {
        type: 'ish-fieldset-field',
        wrappers: ['ish-payment-method-wrapper'],
        fieldGroup: [
          ...paymentMethod.paymentInstruments.map(paymentInstrument => ({
            type: 'ish-radio-field',
            key: 'paymentMethodSelect',
            wrappers: ['form-field-checkbox-horizontal', 'ish-payment-instruments-delete-wrapper'],
            templateOptions: {
              paymentInstrument,
              label: paymentInstrument.accountIdentifier,
              inputClass: 'form-check-input',
              value: paymentInstrument.id,
              deletePaymentInstrumentCallback: (e: PaymentInstrument) =>
                this.paymentMethodCallbacks.find(p => p.name === 'deletePaymentInstrument').callback(e),
            },
          })),
          {
            type: 'ish-payment-parameters-type',
            key: 'payment-parameters',
            fieldGroup: parameters,
          },
        ],
        templateOptions: {
          childClass: 'panel section',
          paymentMethod,
        },
      };
    }
  }
}