/* eslint-disable max-lines */
import { Platform } from 'react-native';
import uuidModule from 'react-native-uuid';

import { emptyFn, isDefined, isEmptyArray, isError, isNotEmptyArray, isNotEmptyString } from '@rnw-community/shared';

import { AndroidPaymentMethodTokenizationType } from '../../@standard/android/enum/android-payment-method-tokenization-type.enum';
import { defaultAndroidPaymentDataRequest } from '../../@standard/android/request/android-payment-data-request';
import { defaultAndroidPaymentMethod } from '../../@standard/android/request/android-payment-method';
import { defaultAndroidTransactionInfo } from '../../@standard/android/request/android-transaction-info';
import { IOSPKContactField } from '../../@standard/ios/enum/ios-pk-contact-field.enum';
import { IosPKMerchantCapability } from '../../@standard/ios/enum/ios-pk-merchant-capability.enum';
import { IosPKPaymentNetworksEnum } from '../../@standard/ios/enum/ios-pk-payment-networks.enum';
import { PaymentMethodNameEnum } from '../../enum/payment-method-name.enum';
import { PaymentsErrorEnum } from '../../enum/payments-error.enum';
import { SupportedNetworkEnum } from '../../enum/supported-networks.enum';
import { ConstructorError } from '../../error/constructor.error';
import { DOMException } from '../../error/dom.exception';
import { PaymentsError } from '../../error/payments.error';
import { getNativePaymentsEventEmitter } from '../../util/get-native-payments-event-emitter/get-native-payments-event-emitter.util';
import { isNativeUserCancellation } from '../../util/is-native-user-cancellation.util';
import { resolvePaymentDetailsModifier } from '../../util/resolve-payment-details-modifier.util';
import { validateAndroidTransactionInfo } from '../../util/validate-android-transaction-info.util';
import { validateDetailsUpdate } from '../../util/validate-details-update.util';
import { validateDisplayItems } from '../../util/validate-display-items.util';
import { validateModifiers } from '../../util/validate-modifiers.util';
import { validatePaymentMethods } from '../../util/validate-payment-methods.util';
import { validateShippingOptions } from '../../util/validate-shipping-options.util';
import { validateShippingType } from '../../util/validate-shipping-type.util';
import { validateTotal } from '../../util/validate-total.util';
import { warnChangeEventError } from '../../util/warn-change-event-error.util';
import { ChangeEventDispatcher } from '../change-event-dispatcher/change-event-dispatcher';
import { NativePayments } from '../native-payments/native-payments';
import { AndroidPaymentResponse } from '../payment-response/android-payment-response';
import { IosPaymentResponse } from '../payment-response/ios-payment-response';

import type { AndroidAllowedCardNetworksEnum } from '../../@standard/android/enum/android-allowed-card-networks.enum';
import type { AndroidPaymentMethodDataDataInterface } from '../../@standard/android/mapping/android-payment-method-data-data.interface';
import type { AndroidPaymentDataRequest } from '../../@standard/android/request/android-payment-data-request';
import type { IosPaymentMethodDataDataInterface } from '../../@standard/ios/mapping/ios-payment-method-data-data.interface';
import type { IosPaymentDataRequest } from '../../@standard/ios/request/ios-payment-data-request';
import type { PaymentDetailsInit } from '../../@standard/w3c/payment-details-init';
import type { PaymentDetailsUpdate } from '../../@standard/w3c/payment-details-update';
import type { PaymentItem } from '../../@standard/w3c/payment-item';
import type { PaymentMethodData } from '../../@standard/w3c/payment-method-data';
import type { NativePaymentDetailsUpdateInterface } from '../../interface/native-payment-details-update.interface';
import type { PaymentRequestEventPayloadInterface } from '../../interface/payment-request-event-payload.interface';
import type { PaymentRequestEventRegistrationInterface } from '../../interface/payment-request-event-registration.interface';
import type { PaymentResponseAddressInterface } from '../../interface/payment-response-address.interface';
import type { ResolvedPaymentDetailsInterface } from '../../interface/resolved-payment-details.interface';
import type { PaymentMethodChangeEventListener } from '../../type/payment-method-change-event-listener.type';
import type { PaymentRequestEventListener } from '../../type/payment-request-event-listener.type';
import type { PaymentRequestEventType } from '../../type/payment-request-event.type';
import type { PaymentRequestUpdateEvent } from '../payment-request-update-event/payment-request-update-event';
import type { Maybe } from '@rnw-community/shared';
import type { EmitterSubscription } from 'react-native';

const uuid = uuidModule as unknown as { v4: () => string };

/**
 * The W3C Payment Request API entry point; construct one per checkout attempt and call `show()` to present it.
 *
 * @see https://developers.google.com/pay/api/android/support/troubleshooting
 * @see https://developers.google.com/pay/api/web/reference/error-objects
 */
export class PaymentRequest {
    readonly id: string;
    updating = false;
    state: 'closed' | 'created' | 'interactive' = 'created';
    couponCode: Maybe<string> = null;
    shippingAddress: Maybe<PaymentResponseAddressInterface> = null;
    shippingOption: Maybe<string> = null;

    private readonly serializedMethodData: string;
    private readonly platformMethodData: AndroidPaymentMethodDataDataInterface | IosPaymentMethodDataDataInterface;
    private readonly eventRegistrations = new Map<PaymentRequestEventType, PaymentRequestEventRegistrationInterface>();
    private readonly pendingDispatchers = new Set<ChangeEventDispatcher>();
    private readonly attributeHandlers = new Map<
        PaymentRequestEventType,
        PaymentMethodChangeEventListener | PaymentRequestEventListener
    >();
    private readonly attributeHandlerWrappers = new Map<PaymentRequestEventType, PaymentRequestEventListener>();
    private eventGeneration = 0;
    private isNativeEventsSynced = false;

    private acceptPromiseRejecter: (reason: unknown) => void = emptyFn;

    constructor(
        readonly methodData: PaymentMethodData[],
        public details: PaymentDetailsInit
    ) {
        if (!isNotEmptyString(details.id)) {
            details.id = uuid.v4();
        }
        this.id = details.id;

        this.validateConstructorInputs(methodData, details);

        this.platformMethodData = this.findPlatformPaymentMethodData();

        const nativePlatformMethodData =
            Platform.OS === 'android'
                ? this.getAndroidPaymentMethodData(
                      this.platformMethodData as AndroidPaymentMethodDataDataInterface,
                      this.resolveEffectiveDetails(details).total
                  )
                : this.getIosPaymentMethodData(this.platformMethodData as IosPaymentMethodDataDataInterface);

        this.serializedMethodData = JSON.stringify(nativePlatformMethodData);
    }

    /**
     * The W3C `PaymentRequest.onshippingaddresschange` event handler attribute.
     *
     * @see https://www.w3.org/TR/payment-request/#dom-paymentrequest-onshippingaddresschange
     */
    get onshippingaddresschange(): Maybe<PaymentRequestEventListener> {
        return this.getAttributeHandler('shippingaddresschange') as Maybe<PaymentRequestEventListener>;
    }

    /**
     * The W3C `PaymentRequest.onshippingoptionchange` event handler attribute.
     *
     * @see https://www.w3.org/TR/payment-request/#dom-paymentrequest-onshippingoptionchange
     */
    get onshippingoptionchange(): Maybe<PaymentRequestEventListener> {
        return this.getAttributeHandler('shippingoptionchange') as Maybe<PaymentRequestEventListener>;
    }

    /**
     * The W3C `PaymentRequest.onpaymentmethodchange` event handler attribute.
     *
     * @see https://www.w3.org/TR/payment-request/#dom-paymentrequest-onpaymentmethodchange
     */
    get onpaymentmethodchange(): Maybe<PaymentMethodChangeEventListener> {
        return this.getAttributeHandler('paymentmethodchange');
    }

    /**
     * The Apple PassKit `couponcodechange` event handler attribute extension (not part of the W3C spec).
     *
     * @see https://developer.apple.com/documentation/passkit/pkpaymentrequest/3801275-couponcode?language=objc
     */
    get oncouponcodechange(): Maybe<PaymentRequestEventListener> {
        return this.getAttributeHandler('couponcodechange') as Maybe<PaymentRequestEventListener>;
    }

    set onshippingaddresschange(listener: Maybe<PaymentRequestEventListener>) {
        this.setAttributeHandler('shippingaddresschange', listener);
    }

    set onshippingoptionchange(listener: Maybe<PaymentRequestEventListener>) {
        this.setAttributeHandler('shippingoptionchange', listener);
    }

    set onpaymentmethodchange(listener: Maybe<PaymentMethodChangeEventListener>) {
        this.setAttributeHandler('paymentmethodchange', listener);
    }

    set oncouponcodechange(listener: Maybe<PaymentRequestEventListener>) {
        this.setAttributeHandler('couponcodechange', listener);
    }

    /**
     * The W3C `PaymentRequest.canMakePayment()` method.
     *
     * @see https://www.w3.org/TR/payment-request/#canmakepayment-method
     */
    async canMakePayment(): Promise<boolean> {
        if (this.state !== 'created') {
            throw new DOMException(PaymentsErrorEnum.InvalidStateError);
        }

        return NativePayments.canMakePayments(this.serializedMethodData);
    }

    /**
     * The W3C `PaymentRequest.hasEnrolledInstrument()` method.
     *
     * @see https://www.w3.org/TR/payment-request/#hasenrolledinstrument-method
     */
    async hasEnrolledInstrument(): Promise<boolean> {
        if (this.state !== 'created') {
            throw new DOMException(PaymentsErrorEnum.InvalidStateError);
        }

        return NativePayments.hasEnrolledInstrument(this.serializedMethodData);
    }

    /**
     * The W3C `PaymentRequest.show()` method.
     *
     * @see https://www.w3.org/TR/payment-request/#show-method
     */
    show(): Promise<AndroidPaymentResponse | IosPaymentResponse> {
        if (this.state !== 'created') {
            return Promise.reject(new DOMException(PaymentsErrorEnum.InvalidStateError));
        }

        this.state = 'interactive';
        this.syncActiveEvents();

        const resolvedDetails = this.resolveEffectiveDetails(this.details);

        const details =
            Platform.OS === 'android'
                ? {
                      ...this.details,
                      environment: (this.platformMethodData as AndroidPaymentMethodDataDataInterface).environment,
                      ...resolvedDetails,
                  }
                : { ...this.details, ...resolvedDetails };

        return new Promise<AndroidPaymentResponse | IosPaymentResponse>((resolve, reject) => {
            this.acceptPromiseRejecter = reject;

            NativePayments.show(this.id, this.serializedMethodData, details)
                .then(jsonDetails => {
                    const paymentResponse = this.handleAccept(jsonDetails);

                    this.closeRequest();
                    resolve(paymentResponse);

                    return void 0;
                })
                .catch((error: unknown) => {
                    this.closeRequest();

                    if (isNativeUserCancellation(error)) {
                        reject(new DOMException(PaymentsErrorEnum.AbortError));

                        return;
                    }

                    reject(isError(error) ? error : new PaymentsError(`Failed showing PaymentRequest`));
                });
        });
    }

    /**
     * The W3C `PaymentRequest.abort()` method.
     *
     * @see https://www.w3.org/TR/payment-request/#abort-method
     */
    async abort(): Promise<void> {
        if (this.state !== 'interactive') {
            throw new DOMException(PaymentsErrorEnum.InvalidStateError);
        }

        await NativePayments.abort().catch(() => {
            throw new PaymentsError(`Failed aborting PaymentRequest`);
        });

        this.closeRequest();
        this.acceptPromiseRejecter(new DOMException(PaymentsErrorEnum.AbortError));
    }

    addEventListener(type: 'paymentmethodchange', listener: PaymentMethodChangeEventListener): void;
    addEventListener(type: PaymentRequestEventType, listener: PaymentRequestEventListener): void;
    addEventListener(
        type: PaymentRequestEventType,
        eventListener: PaymentMethodChangeEventListener | PaymentRequestEventListener
    ): void {
        if (this.state === 'closed') {
            return;
        }

        const listener = eventListener as PaymentRequestEventListener;
        const registration = this.eventRegistrations.get(type);

        if (isDefined(registration)) {
            if (!registration.listeners.includes(listener)) {
                registration.listeners.push(listener);
            }

            return;
        }

        const listeners = [listener];

        this.eventRegistrations.set(type, { listeners, subscription: this.subscribeToNativeEvent(type, listeners) });
        this.syncActiveEvents();
    }

    removeEventListener(type: 'paymentmethodchange', listener: PaymentMethodChangeEventListener): void;
    removeEventListener(type: PaymentRequestEventType, listener: PaymentRequestEventListener): void;
    removeEventListener(
        type: PaymentRequestEventType,
        eventListener: PaymentMethodChangeEventListener | PaymentRequestEventListener
    ): void {
        const registration = this.eventRegistrations.get(type);

        if (!isDefined(registration)) {
            return;
        }

        this.forgetListener(registration, eventListener as PaymentRequestEventListener);

        if (isNotEmptyArray(registration.listeners)) {
            return;
        }

        this.dropRegistration(type, registration);
    }

    private closeRequest(): void {
        this.state = 'closed';
        this.clearEventRegistrations();
    }

    private validateConstructorInputs(methodData: PaymentMethodData[], details: PaymentDetailsInit): void {
        validatePaymentMethods(methodData);
        validateAndroidTransactionInfo(methodData, ConstructorError);
        validateShippingType(methodData, ConstructorError);

        validateTotal(details.total, ConstructorError);

        validateDisplayItems(ConstructorError, details.displayItems);

        validateShippingOptions(ConstructorError, details.shippingOptions);
        validateModifiers(ConstructorError, details.modifiers);
    }

    private getAttributeHandler(
        type: PaymentRequestEventType
    ): Maybe<PaymentMethodChangeEventListener | PaymentRequestEventListener> {
        return this.attributeHandlers.get(type) ?? null;
    }

    private setAttributeHandler(
        type: PaymentRequestEventType,
        listener: Maybe<PaymentMethodChangeEventListener | PaymentRequestEventListener>
    ): void {
        if (!isDefined(listener)) {
            this.attributeHandlers.delete(type);
            this.removeAttributeHandlerWrapper(type);

            return;
        }

        this.attributeHandlers.set(type, listener);
        this.ensureAttributeHandlerWrapper(type);
    }

    private ensureAttributeHandlerWrapper(type: PaymentRequestEventType): void {
        if (this.attributeHandlerWrappers.has(type)) {
            return;
        }

        const wrapper: PaymentRequestEventListener = event => this.dispatchToAttributeHandler(type, event);

        this.attributeHandlerWrappers.set(type, wrapper);
        this.addEventListener(type, wrapper);
    }

    private removeAttributeHandlerWrapper(type: PaymentRequestEventType): void {
        const wrapper = this.attributeHandlerWrappers.get(type);

        if (!isDefined(wrapper)) {
            return;
        }

        this.attributeHandlerWrappers.delete(type);
        this.removeEventListener(type, wrapper);
    }

    private dispatchToAttributeHandler(
        type: PaymentRequestEventType,
        event: PaymentRequestUpdateEvent
    ): Promise<void> | void {
        return (this.attributeHandlers.get(type) as PaymentRequestEventListener)(event);
    }

    private handleAccept(details: string): AndroidPaymentResponse | IosPaymentResponse {
        return Platform.OS === 'android'
            ? new AndroidPaymentResponse(this.id, PaymentMethodNameEnum.AndroidPay, details, this.shippingOption)
            : new IosPaymentResponse(this.id, PaymentMethodNameEnum.ApplePay, details, this.shippingOption);
    }

    private subscribeToNativeEvent(
        type: PaymentRequestEventType,
        listeners: PaymentRequestEventListener[]
    ): Maybe<EmitterSubscription> {
        const eventEmitter = getNativePaymentsEventEmitter();

        if (!isDefined(eventEmitter)) {
            return null;
        }

        return eventEmitter.addListener(type, (payload: PaymentRequestEventPayloadInterface) => {
            this.handleChangeEvent(type, listeners, payload).catch(warnChangeEventError);
        });
    }

    private dropRegistration(type: PaymentRequestEventType, registration: PaymentRequestEventRegistrationInterface): void {
        if (isDefined(registration.subscription)) {
            registration.subscription.remove();
        }

        this.eventRegistrations.delete(type);
        this.syncActiveEvents();
    }

    private syncActiveEvents(): void {
        const eventNames = [...this.eventRegistrations.keys()];
        const { setActiveEvents } = NativePayments;

        if (!isDefined(setActiveEvents) || (isEmptyArray(eventNames) && !this.isNativeEventsSynced)) {
            return;
        }

        this.isNativeEventsSynced = isNotEmptyArray(eventNames);
        setActiveEvents(this.id, eventNames).catch(emptyFn);
    }

    private clearEventRegistrations(): void {
        this.eventGeneration += 1;

        this.pendingDispatchers.forEach(dispatcher => {
            dispatcher.abandon();
        });
        this.pendingDispatchers.clear();

        this.eventRegistrations.forEach(registration => {
            if (isDefined(registration.subscription)) {
                registration.subscription.remove();
            }
        });
        this.eventRegistrations.clear();
        this.syncActiveEvents();
    }

    private forgetListener(
        registration: PaymentRequestEventRegistrationInterface,
        listener: PaymentRequestEventListener
    ): void {
        const listenerIndex = registration.listeners.indexOf(listener);

        if (listenerIndex >= 0) {
            registration.listeners.splice(listenerIndex, 1);
        }
    }

    private async handleChangeEvent(
        type: PaymentRequestEventType,
        listeners: PaymentRequestEventListener[],
        payload: PaymentRequestEventPayloadInterface
    ): Promise<void> {
        const generation = this.eventGeneration;

        if (payload.requestId !== this.id || !this.isDispatchActive(generation)) {
            return;
        }

        this.applyEventPayload(payload);

        if (this.updating) {
            await this.sendDetailsUpdate(type, payload.eventId, null, generation);

            return;
        }

        this.updating = true;

        try {
            await this.dispatchChangeEvent(type, listeners, payload, generation);
        } finally {
            this.updating = false;
        }
    }

    private isDispatchActive(generation: number): boolean {
        return this.state === 'interactive' && this.eventGeneration === generation;
    }

    private async dispatchChangeEvent(
        type: PaymentRequestEventType,
        listeners: PaymentRequestEventListener[],
        payload: PaymentRequestEventPayloadInterface,
        generation: number
    ): Promise<void> {
        const dispatcher = new ChangeEventDispatcher(type, payload, () => this.isDispatchActive(generation));

        this.pendingDispatchers.add(dispatcher);

        try {
            const detailsUpdate = await this.resolveDetailsUpdate(dispatcher, listeners);

            await this.sendDetailsUpdate(type, payload.eventId, detailsUpdate, generation);
        } finally {
            this.pendingDispatchers.delete(dispatcher);
        }
    }

    private applyEventPayload(payload: PaymentRequestEventPayloadInterface): void {
        if (isDefined(payload.shippingAddress)) {
            this.shippingAddress = payload.shippingAddress;
        }

        if (isDefined(payload.shippingOption)) {
            this.shippingOption = payload.shippingOption;
        }

        if (isDefined(payload.couponCode)) {
            this.couponCode = payload.couponCode;
        }
    }

    private async resolveDetailsUpdate(
        dispatcher: ChangeEventDispatcher,
        listeners: PaymentRequestEventListener[]
    ): Promise<Maybe<PaymentDetailsUpdate>> {
        try {
            const detailsUpdate = await dispatcher.dispatch(listeners);

            if (isDefined(detailsUpdate)) {
                validateDetailsUpdate(detailsUpdate);
            }

            return detailsUpdate;
        } catch (error) {
            warnChangeEventError(error);

            return null;
        }
    }

    private async sendDetailsUpdate(
        type: PaymentRequestEventType,
        eventId: number | undefined,
        detailsUpdate: Maybe<PaymentDetailsUpdate>,
        generation: number
    ): Promise<void> {
        const { updatePaymentDetails } = NativePayments;

        if (!this.isDispatchActive(generation) || !isDefined(updatePaymentDetails)) {
            return;
        }

        const updatedDetails = this.getUpdatedDetails(detailsUpdate);
        const resolvedDetails = this.resolveEffectiveDetails(updatedDetails);
        const update: NativePaymentDetailsUpdateInterface = {
            error: detailsUpdate?.error ?? '',
            eventName: type,
            requestId: this.id,
            total: resolvedDetails.total,
            ...(isDefined(eventId) && { eventId }),
        };

        await updatePaymentDetails(update, resolvedDetails.displayItems, updatedDetails.shippingOptions ?? []);

        this.details = updatedDetails;
    }

    private getUpdatedDetails(detailsUpdate: Maybe<PaymentDetailsUpdate>): PaymentDetailsInit {
        if (!isDefined(detailsUpdate)) {
            return this.details;
        }

        return {
            ...this.details,
            ...(isDefined(detailsUpdate.total) && { total: detailsUpdate.total }),
            ...(isDefined(detailsUpdate.displayItems) && { displayItems: detailsUpdate.displayItems }),
            ...(isDefined(detailsUpdate.shippingOptions) && { shippingOptions: detailsUpdate.shippingOptions }),
            ...(isDefined(detailsUpdate.modifiers) && { modifiers: detailsUpdate.modifiers }),
        };
    }

    private resolveEffectiveDetails(details: PaymentDetailsInit): ResolvedPaymentDetailsInterface {
        return resolvePaymentDetailsModifier(
            this.getPlatformSupportedMethod(),
            details.total,
            details.displayItems,
            details.modifiers
        );
    }

    private getPlatformSupportedMethod(): PaymentMethodNameEnum {
        return Platform.OS === 'ios' ? PaymentMethodNameEnum.ApplePay : PaymentMethodNameEnum.AndroidPay;
    }

    private findPlatformPaymentMethodData(): AndroidPaymentMethodDataDataInterface | IosPaymentMethodDataDataInterface {
        const platformSupportedMethod = this.getPlatformSupportedMethod();

        const platformMethod = this.methodData.find(
            paymentMethodData => paymentMethodData.supportedMethods === platformSupportedMethod
        );

        if (!isDefined(platformMethod)) {
            throw new DOMException(PaymentsErrorEnum.NotSupportedError);
        }

        return platformMethod.data;
    }

    private getAndroidPaymentMethodData(
        methodData: AndroidPaymentMethodDataDataInterface,
        total: PaymentItem
    ): AndroidPaymentDataRequest {
        const isBillingRequired =
            methodData.requestBillingAddress === true ||
            methodData.requestPayerName === true ||
            methodData.requestPayerPhone === true;

        const totalPriceStatus = methodData.totalPriceStatus ?? defaultAndroidTransactionInfo.totalPriceStatus;

        return {
            ...defaultAndroidPaymentDataRequest,
            merchantInfo: {
                merchantName: total.label,
            },
            transactionInfo: {
                ...defaultAndroidTransactionInfo,
                currencyCode: methodData.currencyCode,
                totalPrice: total.amount.value,
                totalPriceLabel: total.label,
                countryCode: methodData.countryCode,
                totalPriceStatus,
                ...(isDefined(methodData.checkoutOption) && { checkoutOption: methodData.checkoutOption }),
                ...(isDefined(methodData.transactionId) && { transactionId: methodData.transactionId }),
            },
            allowedPaymentMethods: [
                {
                    ...defaultAndroidPaymentMethod,
                    parameters: {
                        ...defaultAndroidPaymentMethod.parameters,
                        allowedCardNetworks: methodData.supportedNetworks.map(
                            network => network.toUpperCase() as AndroidAllowedCardNetworksEnum
                        ),
                        allowedAuthMethods:
                            methodData.allowedAuthMethods ?? defaultAndroidPaymentMethod.parameters.allowedAuthMethods,
                        ...(isBillingRequired && {
                            billingAddressRequired: true,
                            billingAddressParameters: {
                                format: methodData.requestBillingAddress === true ? 'FULL' : 'MIN',
                                phoneNumberRequired: methodData.requestPayerPhone === true,
                            },
                        }),
                    },
                    ...(isDefined(methodData.gatewayConfig) && {
                        tokenizationSpecification: {
                            parameters: methodData.gatewayConfig,
                            type: AndroidPaymentMethodTokenizationType.PAYMENT_GATEWAY,
                        },
                    }),
                    ...(isDefined(methodData.directConfig) && {
                        tokenizationSpecification: {
                            parameters: methodData.directConfig,
                            type: AndroidPaymentMethodTokenizationType.DIRECT,
                        },
                    }),
                },
            ],
            ...(methodData.requestPayerEmail === true && { emailRequired: true }),
            ...(methodData.requestShipping === true && {
                shippingAddressRequired: true,
                shippingAddressParameters: {
                    phoneNumberRequired: methodData.requestPayerPhone === true,
                },
            }),
        };
    }

    private getIosPaymentMethodData(methodData: IosPaymentMethodDataDataInterface): IosPaymentDataRequest {
        const supportedNetworkMap: Record<SupportedNetworkEnum, IosPKPaymentNetworksEnum> = {
            [SupportedNetworkEnum.Amex]: IosPKPaymentNetworksEnum.PKPaymentNetworkAmex,
            [SupportedNetworkEnum.Mastercard]: IosPKPaymentNetworksEnum.PKPaymentNetworkMasterCard,
            [SupportedNetworkEnum.Visa]: IosPKPaymentNetworksEnum.PKPaymentNetworkVisa,
            [SupportedNetworkEnum.Discover]: IosPKPaymentNetworksEnum.PKPaymentNetworkDiscover,
            [SupportedNetworkEnum.Bancontact]: IosPKPaymentNetworksEnum.PKPaymentNetworkBancontact,
            [SupportedNetworkEnum.CartesBancaires]: IosPKPaymentNetworksEnum.PKPaymentNetworkCartesBancaires,
            [SupportedNetworkEnum.ChinaUnionPay]: IosPKPaymentNetworksEnum.PKPaymentNetworkChinaUnionPay,
            [SupportedNetworkEnum.Dankort]: IosPKPaymentNetworksEnum.PKPaymentNetworkDankort,
            [SupportedNetworkEnum.Eftpos]: IosPKPaymentNetworksEnum.PKPaymentNetworkEftpos,
            [SupportedNetworkEnum.Electron]: IosPKPaymentNetworksEnum.PKPaymentNetworkElectron,
            [SupportedNetworkEnum.Elo]: IosPKPaymentNetworksEnum.PKPaymentNetworkElo,
            [SupportedNetworkEnum.Girocard]: IosPKPaymentNetworksEnum.PKPaymentNetworkGirocard,
            [SupportedNetworkEnum.Interac]: IosPKPaymentNetworksEnum.PKPaymentNetworkInterac,
            [SupportedNetworkEnum.Jcb]: IosPKPaymentNetworksEnum.PKPaymentNetworkJCB,
            [SupportedNetworkEnum.Mada]: IosPKPaymentNetworksEnum.PKPaymentNetworkMada,
            [SupportedNetworkEnum.Maestro]: IosPKPaymentNetworksEnum.PKPaymentNetworkMaestro,
            [SupportedNetworkEnum.Mir]: IosPKPaymentNetworksEnum.PKPaymentNetworkMir,
            [SupportedNetworkEnum.PrivateLabel]: IosPKPaymentNetworksEnum.PKPaymentNetworkPrivateLabel,
            [SupportedNetworkEnum.Vpay]: IosPKPaymentNetworksEnum.PKPaymentNetworkVPay,
        };

        const defaultMerchantCapabilities = [
            IosPKMerchantCapability.PKMerchantCapability3DS,
            IosPKMerchantCapability.PKMerchantCapabilityDebit,
            IosPKMerchantCapability.PKMerchantCapabilityCredit,
        ];

        const requestedShippingFields = this.getRequestedShippingFields(methodData);

        const isShippingRequested = requestedShippingFields.length > 0;

        return {
            countryCode: methodData.countryCode,
            currencyCode: methodData.currencyCode,
            merchantIdentifier: methodData.merchantIdentifier,
            supportedNetworks: methodData.supportedNetworks.map(network => supportedNetworkMap[network]),
            merchantCapabilities: isNotEmptyArray(methodData.merchantCapabilities)
                ? methodData.merchantCapabilities
                : defaultMerchantCapabilities,
            ...(methodData.requestBillingAddress === true && {
                requiredBillingContactFields: [IOSPKContactField.PKContactFieldPostalAddress],
            }),
            ...(isShippingRequested && { requiredShippingContactFields: requestedShippingFields }),
            ...(isDefined(methodData.applicationData) && { applicationData: methodData.applicationData }),
            ...(isNotEmptyString(methodData.couponCode) && { couponCode: methodData.couponCode }),
            ...(isDefined(methodData.shippingType) && { shippingType: methodData.shippingType }),
        };
    }

    private getRequestedShippingFields(methodData: IosPaymentMethodDataDataInterface): IOSPKContactField[] {
        const requiredShippingFields: IOSPKContactField[] = [];
        if (methodData.requestPayerEmail ?? false) {
            requiredShippingFields.push(IOSPKContactField.PKContactFieldEmailAddress);
        }
        if (methodData.requestPayerName ?? false) {
            requiredShippingFields.push(IOSPKContactField.PKContactFieldName);
        }
        if (methodData.requestPayerPhone ?? false) {
            requiredShippingFields.push(IOSPKContactField.PKContactFieldPhoneNumber);
        }
        if (methodData.requestShipping ?? false) {
            requiredShippingFields.push(IOSPKContactField.PKContactFieldPostalAddress);
        }

        return requiredShippingFields;
    }
}
