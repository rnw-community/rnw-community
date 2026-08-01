#import "Payments.h"

#import <React/RCTLog.h>
#import <Contacts/Contacts.h>
#import <Foundation/Foundation.h>
#import <objc/runtime.h>

static NSString *const PaymentsPaymentMethodChangeEvent = @"paymentmethodchange";
static NSString *const PaymentsShippingAddressChangeEvent = @"shippingaddresschange";
static NSString *const PaymentsShippingOptionChangeEvent = @"shippingoptionchange";
static NSString *const PaymentsCouponCodeChangeEvent = @"couponcodechange";

@interface Payments ()

@property (nonatomic, copy) NSString * _Nullable activeRequestId;
@property (nonatomic, strong) NSMutableSet<NSString *> * _Nonnull activeEventNames;
@property (nonatomic, strong) NSMutableDictionary<NSString *, id> * _Nonnull pendingEventCompletions;
@property (nonatomic, strong) NSMutableDictionary<NSString *, NSNumber *> * _Nonnull pendingEventIds;
@property (nonatomic, assign) NSUInteger lastEventId;
@property (nonatomic, copy) NSArray<PKPaymentSummaryItem *> * _Nonnull currentPaymentSummaryItems;
@property (nonatomic, copy) NSArray<PKShippingMethod *> * _Nonnull currentShippingMethods;
@property (nonatomic, assign) BOOL isSheetPresented;
@property (nonatomic, assign) BOOL hasChangeEventListeners;

@end

// TODO: Add logs
@implementation Payments

RCT_EXPORT_MODULE()

static const PKMerchantCapability PKMerchantCapabilityUnknown = 9999;
static const PKPaymentNetwork PKPaymentNetworkUnknown = 0;

- (instancetype)init
{
    if ((self = [super init])) {
        _activeEventNames = [NSMutableSet set];
        _pendingEventCompletions = [NSMutableDictionary dictionary];
        _pendingEventIds = [NSMutableDictionary dictionary];
        _currentPaymentSummaryItems = @[];
        _currentShippingMethods = @[];
    }

    return self;
}

+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

// https://reactnative.dev/docs/native-modules-ios#threading
- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}

- (NSArray<NSString *> *)supportedEvents
{
    return @[
        PaymentsPaymentMethodChangeEvent,
        PaymentsShippingAddressChangeEvent,
        PaymentsShippingOptionChangeEvent,
        PaymentsCouponCodeChangeEvent
    ];
}

- (void)startObserving
{
    self.hasChangeEventListeners = YES;
}

- (void)stopObserving
{
    self.hasChangeEventListeners = NO;

    [self flushPendingEventCompletions];
}

- (void)invalidate
{
    PKPaymentAuthorizationViewController *presentedViewController = self.viewController;

    [self teardownPaymentSheetState];

    if (presentedViewController != nil) {
        presentedViewController.delegate = nil;

        dispatch_async(dispatch_get_main_queue(), ^{
            [presentedViewController dismissViewControllerAnimated:NO completion:nil];
        });
    }

    [super invalidate];
}

RCT_EXPORT_METHOD(show:(NSString *)methodDataString
                        details:(NSDictionary *)details
                        resolve:(RCTPromiseResolveBlock)resolve
                        reject:(RCTPromiseRejectBlock)reject)
{
    self.paymentResolve = resolve;
    self.paymentReject = reject;

    [self flushPendingEventCompletions];
    self.isSheetPresented = NO;

    NSData *jsonData = [methodDataString dataUsingEncoding:NSUTF8StringEncoding];

    NSError *error;
    NSDictionary *methodData = [NSJSONSerialization JSONObjectWithData:jsonData options:kNilOptions error:&error];
    if (error) {
        [self rejectPromise:@"wrong_payment_data" message:@"Invalid JSON payment methodData passed" error:nil];
        return;
    }

    NSString *merchantId = methodData[@"merchantIdentifier"];
    NSString *countryCode = methodData[@"countryCode"];
    NSString *currencyCode = methodData[@"currencyCode"];

    if (!merchantId) {
        [self rejectPromise:@"no_merchant_id" message:@"No merchant identifier provided" error:nil];
        return;
    }

    // TODO: Should we add supportedCountries config, if android has the same?
    // https://developer.apple.com/documentation/passkit/pkpaymentrequest/2865929-supportedcountries?language=objc
    if(!countryCode) {
        [self rejectPromise:@"no_country_code" message:@"No country code provided" error:nil];
        return;
    }

    if(!currencyCode) {
        [self rejectPromise:@"no_currency_code" message:@"No currency code provided" error:nil];
        return;
    }

    // https://developer.apple.com/documentation/passkit/pkpaymentrequest/1833288-availablenetworks?language=objc
    // https://developer.apple.com/documentation/passkit/pkpaymentrequest/1619329-supportednetworks?language=objc
    // https://developer.apple.com/documentation/passkit/pkpaymentnetwork?language=objc
    NSMutableArray *supportedNetworks =  [NSMutableArray array];
    for (NSString *supportedNetwork in methodData[@"supportedNetworks"]) {
        PKPaymentNetwork paymentNetwork = [self paymentNetworkFromString:supportedNetwork];
        if (paymentNetwork != PKPaymentNetworkUnknown) {
            [supportedNetworks addObject:paymentNetwork];
        } else {
            [self rejectPromise:@"invalid_supported_network" message:[NSString stringWithFormat:@"Invalid supportedNetwork passed '%@'", supportedNetwork] error:nil];
            return;
        }
    }

    NSMutableArray *requiredBillingContactFields = [NSMutableArray array];
    for (NSString *requiredBillingContactField in methodData[@"requiredBillingContactFields"]) {
        PKContactField contactField = [self contactFieldFromString:requiredBillingContactField];
        if(contactField != nil) {
            [requiredBillingContactFields addObject:contactField];
        } else {
            [self rejectPromise:@"invalid_contact_field" message:[NSString stringWithFormat:@"Invalid contact field passed '%@'", contactField] error:nil];
            return;
        }
    }

    NSMutableArray *requiredShippingContactFields = [NSMutableArray array];
    for (NSString *requiredShippingContactField in methodData[@"requiredShippingContactFields"]) {
        PKContactField contactField = [self contactFieldFromString:requiredShippingContactField];
        if(contactField != nil) {
            [requiredShippingContactFields addObject:contactField];
        } else {
            [self rejectPromise:@"invalid_contact_field" message:[NSString stringWithFormat:@"Invalid contact field passed '%@'", contactField] error:nil];
            return;
        }
    }


    // https://developer.apple.com/documentation/passkit/pkpaymentrequest/1619257-merchantcapabilities?language=objc
    NSArray *merchantCapabilitiesArray = methodData[@"merchantCapabilities"];
    PKMerchantCapability merchantCapabilities = 0;
    if (merchantCapabilitiesArray.count > 0) {
        for (NSString *capabilityString in merchantCapabilitiesArray) {
            PKMerchantCapability capability = [self merchantCapabilityFromString:capabilityString];
            if (capability != PKMerchantCapabilityUnknown) {
                merchantCapabilities |= capability;
            } else {
                [self rejectPromise:@"invalid_merchant_capability" message:[NSString stringWithFormat:@"Invalid merchant capability passed '%@'", capabilityString] error:nil];
                return;
            }
        }
    }

    PKPaymentRequest *paymentRequest = [[PKPaymentRequest alloc] init];
    paymentRequest.merchantCapabilities = merchantCapabilities;
    paymentRequest.supportedNetworks = supportedNetworks;

    // https://developer.apple.com/documentation/passkit/pkpaymentrequest/1619305-merchantidentifier?language=objc
    paymentRequest.merchantIdentifier = merchantId;

    // https://developer.apple.com/documentation/passkit/pkpaymentrequest/1619246-countrycode?language=objc
    paymentRequest.countryCode = countryCode;

    // https://developer.apple.com/documentation/passkit/pkpaymentrequest/1619248-currencycode?language=objc
    paymentRequest.currencyCode = currencyCode;

    // https://developer.apple.com/documentation/applepayontheweb/applepaypaymentrequest/applicationdata?language=objc
    id applicationData = methodData[@"applicationData"];
    if (applicationData != nil) {
        if ([applicationData isKindOfClass:[NSString class]]) {
            // Convert string to NSData
            NSData *appData = [(NSString *)applicationData dataUsingEncoding:NSUTF8StringEncoding];
            if (appData) {
                paymentRequest.applicationData = appData;
            } else {
                [self rejectPromise:@"invalid_application_data" message:@"Could not convert applicationData to NSData" error:nil];
                return;
            }
        } else if([applicationData isKindOfClass:[NSDictionary class]] || [applicationData isKindOfClass:[NSArray class]]) {
            // If it's already JSON or a dictionary, convert to NSData
            NSError *jsonError;
            NSData *appData = [NSJSONSerialization dataWithJSONObject:applicationData options:0 error:&jsonError];
            if (!jsonError && appData) {
                paymentRequest.applicationData = appData;
            } else {
                [self rejectPromise:@"invalid_application_data" message:@"applicationData must be a valid string or JSON object" error:jsonError];
                return;
            }
        } else {
            [self rejectPromise:@"invalid_application_data" message:@"applicationData must be a string, dictionary, or array" error:nil];
            return;
        }    
    }

    // https://developer.apple.com/documentation/passkit/pkpaymentrequest/1619231-paymentsummaryitems?language=objc
    paymentRequest.paymentSummaryItems = [self getPaymentSummaryItemsFromDetails:details];
    self.currentPaymentSummaryItems = paymentRequest.paymentSummaryItems;
    self.currentShippingMethods = @[];

    // https://developer.apple.com/documentation/passkit/pkpaymentrequest/1619228-shippingmethods?language=objc
    if ([self isChangeEventActive:PaymentsShippingOptionChangeEvent]) {
        self.currentShippingMethods = [self getShippingMethodsFromShippingOptions:details[@"shippingOptions"]];
        paymentRequest.shippingMethods = self.currentShippingMethods;
    }

    // https://developer.apple.com/documentation/passkit/pkpaymentrequest/3822251-supportscouponcode?language=objc
    // https://developer.apple.com/documentation/passkit/pkpaymentrequest/3801275-couponcode?language=objc
    if ([self isChangeEventActive:PaymentsCouponCodeChangeEvent]) {
        if (@available(iOS 15.0, *)) {
            paymentRequest.supportsCouponCode = YES;

            id couponCode = methodData[@"couponCode"];
            if ([couponCode isKindOfClass:[NSString class]] && [(NSString *)couponCode length] > 0) {
                paymentRequest.couponCode = (NSString *)couponCode;
            }
        }
    }

    // HINT: ShippingOptions is not a part of the W3C Spec anymore
    // https://developer.mozilla.org/en-US/docs/Web/API/PaymentRequest/shippingOption
    // https://developer.mozilla.org/en-US/docs/Web/API/PaymentRequest/shippingAddress

    // https://developer.apple.com/documentation/passkit/pkpaymentrequest/2865928-requiredbillingcontactfields?language=objc
    if(methodData[@"requiredBillingContactFields"]) {
        paymentRequest.requiredBillingContactFields = [NSSet setWithArray:requiredBillingContactFields];
    }

    // https://developer.apple.com/documentation/passkit/pkpaymentrequest/2865927-requiredshippingcontactfields?language=objc
    if(methodData[@"requiredShippingContactFields"]) {
        paymentRequest.requiredShippingContactFields = [NSSet setWithArray:requiredShippingContactFields];
    }

    // https://developer.apple.com/documentation/passkit/pkpaymentauthorizationviewcontroller/1616178-initwithpaymentrequest?language=objc
    self.viewController = [[PKPaymentAuthorizationViewController alloc] initWithPaymentRequest: paymentRequest];
    self.viewController.delegate = self;

    if (!self.viewController) {
        [self rejectPromise:@"no_view_controller" message:@"Failed initializing PKPaymentAuthorizationViewController, check you app ApplePay capabilities and merchantIdentifier" error:nil];
        return;
    }

    UIViewController *rootViewController = RCTPresentedViewController();
    [rootViewController presentViewController:self.viewController animated:YES completion:nil];

    self.isSheetPresented = YES;
}

RCT_EXPORT_METHOD(abort: (RCTPromiseResolveBlock)resolve
                          reject:(RCTPromiseRejectBlock)reject)
{
    PKPaymentAuthorizationViewController *presentedViewController = self.viewController;

    [self teardownPaymentSheetState];

    if (!presentedViewController) {
        resolve(nil);
        return;
    }

    [presentedViewController dismissViewControllerAnimated:YES completion:^{
        resolve(nil);
    }];
}

RCT_EXPORT_METHOD(complete: (NSString *)paymentStatus
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    PKPaymentAuthorizationStatus status = PKPaymentAuthorizationStatusFailure;

    if ([paymentStatus isEqualToString: @"success"]) {
        status = PKPaymentAuthorizationStatusSuccess;
    }

    PKPaymentAuthorizationViewController *presentedViewController = self.viewController;

    [self invokeAuthorizationCompletionWithStatus:status];
    [self teardownPaymentSheetState];

    dispatch_async(dispatch_get_main_queue(), ^{
        if (presentedViewController.presentingViewController) {
            [presentedViewController dismissViewControllerAnimated:YES completion:^{
                resolve(nil);
            }];
        } else {
            resolve(nil);
        }
    });
}

RCT_EXPORT_METHOD(setActiveEvents: (NSString *)requestId
                       eventNames:(NSArray *)eventNames
                          resolve:(RCTPromiseResolveBlock)resolve
                           reject:(RCTPromiseRejectBlock)reject)
{
    if (eventNames.count == 0) {
        if ([self isActiveRequestId:requestId]) {
            [self clearActiveEvents];
        }

        resolve(nil);
        return;
    }

    if (self.isSheetPresented && self.activeRequestId != nil && ![self isActiveRequestId:requestId]) {
        RCTLogWarn(@"Payments: ignoring change events of '%@', the payment sheet of '%@' is presented", requestId, self.activeRequestId);
        resolve(nil);
        return;
    }

    if (![self isActiveRequestId:requestId]) {
        [self flushPendingEventCompletions];
        self.activeRequestId = requestId;
    }

    [self.activeEventNames removeAllObjects];
    [self.activeEventNames addObjectsFromArray:eventNames];
    [self flushPendingCompletionsOfInactiveEvents];

    resolve(nil);
}

RCT_EXPORT_METHOD(updatePaymentDetails: (NSDictionary *)update
                            displayItems:(NSArray *)displayItems
                         shippingOptions:(NSArray *)shippingOptions
                                 resolve:(RCTPromiseResolveBlock)resolve
                                  reject:(RCTPromiseRejectBlock)reject)
{
    NSString *requestId = update[@"requestId"];
    NSString *eventName = update[@"eventName"];

    if (![eventName isKindOfClass:[NSString class]] || ![requestId isKindOfClass:[NSString class]]) {
        reject(@"no_completion", @"Payment details update is missing its requestId or eventName", nil);
        return;
    }

    if (![self isActiveRequestId:requestId] || !self.pendingEventCompletions[eventName]) {
        reject(@"no_completion", @"No payment sheet change event is waiting for a response", nil);
        return;
    }

    id eventId = update[@"eventId"];
    if ([eventId isKindOfClass:[NSNumber class]] && ![eventId isEqual:self.pendingEventIds[eventName]]) {
        RCTLogWarn(@"Payments: dropping the answer of the superseded '%@' event %@", eventName, eventId);
        reject(@"no_completion", @"The answered change event was superseded by a newer one", nil);
        return;
    }

    NSDictionary *total = update[@"total"];
    if ([total isKindOfClass:[NSDictionary class]]) {
        self.currentPaymentSummaryItems = [self getPaymentSummaryItemsFromDetails:@{
            @"displayItems": displayItems ?: @[],
            @"total": total
        }];
    }

    if ([self isChangeEventActive:PaymentsShippingOptionChangeEvent]) {
        self.currentShippingMethods = [self getShippingMethodsFromShippingOptions:shippingOptions];
    }

    [self resolveChangeEvent:eventName errors:[self getErrorsForEvent:eventName error:update[@"error"]]];

    resolve(nil);
}

RCT_EXPORT_METHOD(canMakePayments: (NSString *)methodDataString
                                   resolve:(RCTPromiseResolveBlock)resolve
                                   reject:(RCTPromiseRejectBlock)reject)
{
    // TODO: We can implement https://developer.apple.com/documentation/passkit/pkpaymentauthorizationviewcontroller/1616181-canmakepaymentsusingnetworks?language=objc
    // for this we need to extract parsing and validating methods from the show method and reuse in both places.

    // https://developer.apple.com/documentation/passkit/pkpaymentauthorizationviewcontroller/1616192-canmakepayments?language=objc
    resolve(@([PKPaymentAuthorizationViewController canMakePayments]));
}

// DELEGATES https://developer.apple.com/documentation/passkit/pkpaymentauthorizationviewcontrollerdelegate?language=objc

// https://developer.apple.com/documentation/passkit/pkpaymentauthorizationviewcontrollerdelegate/1616180-paymentauthorizationviewcontroll?language=objc
- (void) paymentAuthorizationViewControllerDidFinish:(PKPaymentAuthorizationViewController *)controller
{
    [self teardownPaymentSheetState];

    __weak __typeof(self) weakSelf = self;
    [controller dismissViewControllerAnimated:YES completion:^{
        [weakSelf rejectPromise:@"payment_error" message:@"Payment process canceled by user." error:nil];
    }];
}

// https://developer.apple.com/documentation/passkit/pkpaymentauthorizationviewcontrollerdelegate/2867084-paymentauthorizationviewcontroll?language=objc
- (void) paymentAuthorizationViewController:(PKPaymentAuthorizationViewController *)controller
                   didSelectShippingContact:(PKContact *)contact
                                    handler:(void (^)(PKPaymentRequestShippingContactUpdate *update))completion
{
    [self handleChangeEvent:PaymentsShippingAddressChangeEvent
                       body:@{ @"shippingAddress": [self getAddressFromPostalAddress:contact.postalAddress] }
                 completion:completion];
}

// https://developer.apple.com/documentation/passkit/pkpaymentauthorizationviewcontrollerdelegate/2867080-paymentauthorizationviewcontroll?language=objc
- (void) paymentAuthorizationViewController:(PKPaymentAuthorizationViewController *)controller
                    didSelectShippingMethod:(PKShippingMethod *)shippingMethod
                                    handler:(void (^)(PKPaymentRequestShippingMethodUpdate *update))completion
{
    [self handleChangeEvent:PaymentsShippingOptionChangeEvent
                       body:@{ @"shippingOption": shippingMethod.identifier ?: @"" }
                 completion:completion];
}

// https://developer.apple.com/documentation/passkit/pkpaymentauthorizationviewcontrollerdelegate/2867082-paymentauthorizationviewcontroll?language=objc
- (void) paymentAuthorizationViewController:(PKPaymentAuthorizationViewController *)controller
                     didSelectPaymentMethod:(PKPaymentMethod *)paymentMethod
                                    handler:(void (^)(PKPaymentRequestPaymentMethodUpdate *update))completion
{
    [self handleChangeEvent:PaymentsPaymentMethodChangeEvent
                       body:@{
                           @"methodName": @"apple-pay",
                           @"methodDetails": [self getMethodDetailsFromPaymentMethod:paymentMethod]
                       }
                 completion:completion];
}

// https://developer.apple.com/documentation/passkit/pkpaymentauthorizationviewcontrollerdelegate/3762136-paymentauthorizationviewcontroll?language=objc
- (void) paymentAuthorizationViewController:(PKPaymentAuthorizationViewController *)controller
                        didChangeCouponCode:(NSString *)couponCode
                                    handler:(void (^)(PKPaymentRequestCouponCodeUpdate *update))completion API_AVAILABLE(ios(15.0))
{
    [self handleChangeEvent:PaymentsCouponCodeChangeEvent
                       body:@{ @"couponCode": couponCode ?: @"" }
                 completion:completion];
}

// https://developer.apple.com/documentation/passkit/pkpaymentauthorizationviewcontrollerdelegate/2865759-paymentauthorizationviewcontroll?language=objc
- (void) paymentAuthorizationViewController:(PKPaymentAuthorizationViewController *)controller
                        didAuthorizePayment:(PKPayment *)payment
                                    handler:(void (^)(PKPaymentAuthorizationResult *result))completion
{
    self.authorizationCompletion = completion;

    [self flushPendingEventCompletions];

    NSMutableDictionary *paymentDict = [NSMutableDictionary dictionary];

    NSMutableDictionary *tokenDict = [NSMutableDictionary dictionary];
    tokenDict[@"transactionIdentifier"] = payment.token.transactionIdentifier;

    NSString *paymentData64 = [payment.token.paymentData base64EncodedStringWithOptions:0];
    NSData *decodedPaymentData = [[NSData alloc] initWithBase64EncodedString:paymentData64 options:0];
    tokenDict[@"paymentData"] = [[NSString alloc] initWithData:decodedPaymentData encoding:NSUTF8StringEncoding];

    NSMutableDictionary *paymentMethodDict = [NSMutableDictionary dictionary];
    paymentMethodDict[@"displayName"] = payment.token.paymentMethod.displayName;
    paymentMethodDict[@"network"] = payment.token.paymentMethod.network;
    paymentMethodDict[@"type"] = [self stringFromPaymentMethodType:payment.token.paymentMethod.type];

    tokenDict[@"paymentMethod"] = paymentMethodDict;

    paymentDict[@"token"] = tokenDict;

    PKContact *billingContact = payment.billingContact;
    if (billingContact) {
        NSMutableDictionary *billingContactDict = [NSMutableDictionary dictionary];

        CNPostalAddress *postalAddress = billingContact.postalAddress;
        NSMutableDictionary *postalAddressDict = [NSMutableDictionary dictionary];
        if (postalAddress) {
            postalAddressDict[@"street"] = postalAddress.street;
            postalAddressDict[@"city"] = postalAddress.city;
            postalAddressDict[@"state"] = postalAddress.state;
            postalAddressDict[@"postalCode"] = postalAddress.postalCode;
            postalAddressDict[@"country"] = postalAddress.country;
            postalAddressDict[@"ISOCountryCode"] = postalAddress.ISOCountryCode;
        }

        billingContactDict[@"postalAddress"] = postalAddressDict;

        paymentDict[@"billingContact"] = billingContactDict;
    }

    PKContact *shippingContact = payment.shippingContact;
    if (shippingContact) {
        NSMutableDictionary *shippingContactDict = [NSMutableDictionary dictionary];
        shippingContactDict[@"emailAddress"] = shippingContact.emailAddress;

        CNPhoneNumber *phoneNumber = shippingContact.phoneNumber;
        NSMutableDictionary *phoneNumberDict = [NSMutableDictionary dictionary];
        phoneNumberDict[@"stringValue"] = phoneNumber.stringValue;
        shippingContactDict[@"phoneNumber"] = phoneNumberDict;

        CNPostalAddress *postalAddress = shippingContact.postalAddress;
        NSMutableDictionary *postalAddressDict = [NSMutableDictionary dictionary];
        if (postalAddress) {
            postalAddressDict[@"street"] = postalAddress.street;
            postalAddressDict[@"city"] = postalAddress.city;
            postalAddressDict[@"state"] = postalAddress.state;
            postalAddressDict[@"postalCode"] = postalAddress.postalCode;
            postalAddressDict[@"country"] = postalAddress.country;
            postalAddressDict[@"ISOCountryCode"] = postalAddress.ISOCountryCode;
        }
        shippingContactDict[@"postalAddress"] = postalAddressDict;

        NSPersonNameComponents *nameComponents = shippingContact.name;
        NSMutableDictionary *nameDict = [NSMutableDictionary dictionary];
        if (nameComponents) {
            nameDict[@"givenName"] = nameComponents.givenName;
            nameDict[@"familyName"] = nameComponents.familyName;
            nameDict[@"middleName"] = nameComponents.middleName;
            nameDict[@"namePrefix"] = nameComponents.namePrefix;
            nameDict[@"nameSuffix"] = nameComponents.nameSuffix;
            nameDict[@"nickname"] = nameComponents.nickname;
        }
        shippingContactDict[@"name"] = nameDict;

        paymentDict[@"shippingContact"] = shippingContactDict;
    }

    // TODO: Add shippingMethod

    NSError *error;
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:paymentDict options:NSJSONWritingPrettyPrinted error:&error];

    if (!jsonData) {
        [self rejectPromise:@"json_serialization_error" message:@"Failed to serialize PKPayment to JSON." error:error];
    } else {
        NSString *jsonString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
        self.paymentResolve(jsonString);
    }

    self.paymentReject = nil;
    self.paymentResolve = nil;
}

// PRIVATE METHODS

- (BOOL)isActiveRequestId:(NSString *_Nullable)requestId
{
    return self.activeRequestId != nil && [requestId isKindOfClass:[NSString class]] && [self.activeRequestId isEqualToString:requestId];
}

- (BOOL)isChangeEventActive:(NSString *_Nonnull)eventName
{
    return self.hasChangeEventListeners && self.activeRequestId != nil && [self.activeEventNames containsObject:eventName];
}

- (void)handleChangeEvent:(NSString *_Nonnull)eventName
                     body:(NSDictionary *_Nonnull)body
               completion:(id _Nonnull)completion
{
    [self resolveChangeEvent:eventName errors:@[]];

    self.lastEventId += 1;
    self.pendingEventCompletions[eventName] = [completion copy];
    self.pendingEventIds[eventName] = @(self.lastEventId);

    if (![self isChangeEventActive:eventName]) {
        [self resolveChangeEvent:eventName errors:@[]];
        return;
    }

    NSMutableDictionary *eventBody = [body mutableCopy];
    eventBody[@"requestId"] = self.activeRequestId ?: @"";
    eventBody[@"eventId"] = @(self.lastEventId);

    [self sendEventWithName:eventName body:eventBody];
}

- (void)resolveChangeEvent:(NSString *_Nonnull)eventName errors:(NSArray<NSError *> *_Nonnull)errors
{
    if (self.pendingEventCompletions[eventName] == nil) {
        return;
    }

    NSArray<PKPaymentSummaryItem *> *summaryItems = self.currentPaymentSummaryItems;
    NSArray<PKShippingMethod *> *shippingMethods = self.currentShippingMethods;

    if ([eventName isEqualToString:PaymentsShippingAddressChangeEvent]) {
        void (^handler)(PKPaymentRequestShippingContactUpdate *) = [self takePendingCompletionOfEvent:eventName];
        handler([[PKPaymentRequestShippingContactUpdate alloc] initWithErrors:errors paymentSummaryItems:summaryItems shippingMethods:shippingMethods]);
        return;
    }

    if ([eventName isEqualToString:PaymentsShippingOptionChangeEvent]) {
        void (^handler)(PKPaymentRequestShippingMethodUpdate *) = [self takePendingCompletionOfEvent:eventName];
        handler([[PKPaymentRequestShippingMethodUpdate alloc] initWithPaymentSummaryItems:summaryItems]);
        return;
    }

    if ([eventName isEqualToString:PaymentsPaymentMethodChangeEvent]) {
        void (^handler)(PKPaymentRequestPaymentMethodUpdate *) = [self takePendingCompletionOfEvent:eventName];
        handler([self getPaymentMethodUpdateWithSummaryItems:summaryItems errors:errors]);
        return;
    }

    if ([eventName isEqualToString:PaymentsCouponCodeChangeEvent]) {
        if (@available(iOS 15.0, *)) {
            void (^handler)(PKPaymentRequestCouponCodeUpdate *) = [self takePendingCompletionOfEvent:eventName];
            handler([[PKPaymentRequestCouponCodeUpdate alloc] initWithErrors:errors paymentSummaryItems:summaryItems shippingMethods:shippingMethods]);
            return;
        }
    }

    RCTLogWarn(@"Payments: '%@' has no PassKit update type here, its completion stays pending", eventName);
}

- (id _Nonnull)takePendingCompletionOfEvent:(NSString *_Nonnull)eventName
{
    id completion = self.pendingEventCompletions[eventName];

    [self.pendingEventCompletions removeObjectForKey:eventName];
    [self.pendingEventIds removeObjectForKey:eventName];

    return completion;
}

- (PKPaymentRequestPaymentMethodUpdate *_Nonnull)getPaymentMethodUpdateWithSummaryItems:(NSArray<PKPaymentSummaryItem *> *_Nonnull)summaryItems
                                                                                errors:(NSArray<NSError *> *_Nonnull)errors
{
    if (errors.count > 0) {
        if (@available(iOS 15.0, *)) {
            return [[PKPaymentRequestPaymentMethodUpdate alloc] initWithErrors:errors paymentSummaryItems:summaryItems];
        }
    }

    return [[PKPaymentRequestPaymentMethodUpdate alloc] initWithPaymentSummaryItems:summaryItems];
}

- (void)flushPendingEventCompletions
{
    for (NSString *eventName in [self.pendingEventCompletions allKeys]) {
        [self resolveChangeEvent:eventName errors:@[]];
    }
}

- (void)flushPendingCompletionsOfInactiveEvents
{
    for (NSString *eventName in [self.pendingEventCompletions allKeys]) {
        if (![self.activeEventNames containsObject:eventName]) {
            [self resolveChangeEvent:eventName errors:@[]];
        }
    }
}

- (void)clearActiveEvents
{
    [self flushPendingEventCompletions];
    [self.activeEventNames removeAllObjects];

    self.activeRequestId = nil;
}

- (void)teardownPaymentSheetState
{
    [self invokeAuthorizationCompletionWithStatus:PKPaymentAuthorizationStatusFailure];
    [self clearActiveEvents];

    self.isSheetPresented = NO;
    self.viewController = nil;
}

- (void)invokeAuthorizationCompletionWithStatus:(PKPaymentAuthorizationStatus)status
{
    void (^completion)(PKPaymentAuthorizationResult *) = self.authorizationCompletion;

    if (completion == nil) {
        return;
    }

    self.authorizationCompletion = nil;
    completion([[PKPaymentAuthorizationResult alloc] initWithStatus:status errors:nil]);
}

- (NSArray<NSError *> *_Nonnull)getErrorsForEvent:(NSString *_Nonnull)eventName error:(id _Nullable)error
{
    if ([eventName isEqualToString:PaymentsShippingOptionChangeEvent]) {
        if (error != nil && ![error isEqual:@""]) {
            RCTLogWarn(@"Payments: PassKit cannot surface an error for '%@', ignoring '%@'", eventName, error);
        }

        return @[];
    }

    if ([error isKindOfClass:[NSDictionary class]]) {
        return [self getFieldErrorsFromError:(NSDictionary *)error];
    }

    return [self getUnstructuredErrorsForEvent:eventName message:error];
}

// https://developer.apple.com/documentation/passkit/pkpaymenterrordomain?language=objc
- (NSArray<NSError *> *_Nonnull)getFieldErrorsFromError:(NSDictionary *_Nonnull)error
{
    id message = error[@"message"];

    if (![message isKindOfClass:[NSString class]] || [(NSString *)message length] == 0) {
        return @[];
    }

    id errorType = error[@"type"];

    if ([errorType isEqual:@"shippingAddressField"]) {
        NSString *addressKey = [self postalAddressKeyFromString:error[@"key"]];

        return addressKey == nil
            ? @[]
            : @[[PKPaymentRequest paymentShippingAddressInvalidErrorWithKey:addressKey localizedDescription:message]];
    }

    if ([errorType isEqual:@"contactField"]) {
        PKContactField contactField = [self contactFieldFromPayerField:error[@"field"]];

        return contactField == nil
            ? @[]
            : @[[PKPaymentRequest paymentContactInvalidErrorWithContactField:contactField localizedDescription:message]];
    }

    if ([errorType isEqual:@"couponCode"]) {
        return [self getCouponCodeErrorsWithMessage:message expired:[error[@"expired"] isEqual:@YES]];
    }

    RCTLogWarn(@"Payments: '%@' is not a known payment error type, ignoring '%@'", errorType, message);

    return @[];
}

- (NSArray<NSError *> *_Nonnull)getUnstructuredErrorsForEvent:(NSString *_Nonnull)eventName message:(id _Nullable)message
{
    if (![message isKindOfClass:[NSString class]] || [(NSString *)message length] == 0) {
        return @[];
    }

    if ([eventName isEqualToString:PaymentsShippingAddressChangeEvent]) {
        return @[[PKPaymentRequest paymentShippingAddressUnserviceableErrorWithLocalizedDescription:message]];
    }

    if ([eventName isEqualToString:PaymentsCouponCodeChangeEvent]) {
        return [self getCouponCodeErrorsWithMessage:message expired:NO];
    }

    return @[[NSError errorWithDomain:PKPaymentErrorDomain code:PKPaymentUnknownError userInfo:@{ NSLocalizedDescriptionKey: message }]];
}

- (NSArray<NSError *> *_Nonnull)getCouponCodeErrorsWithMessage:(NSString *_Nonnull)message expired:(BOOL)expired
{
    if (@available(iOS 15.0, *)) {
        return @[expired
            ? [PKPaymentRequest paymentCouponCodeExpiredErrorWithLocalizedDescription:message]
            : [PKPaymentRequest paymentCouponCodeInvalidErrorWithLocalizedDescription:message]];
    }

    return @[];
}

// https://developer.apple.com/documentation/contacts/cnpostaladdress?language=objc
- (NSString *_Nullable)postalAddressKeyFromString:(id _Nullable)addressField
{
    static NSDictionary<NSString *, NSString *> *postalAddressKeys;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        postalAddressKeys = @{
            @"addressLine": CNPostalAddressStreetKey,
            @"city": CNPostalAddressCityKey,
            @"country": CNPostalAddressISOCountryCodeKey,
            @"dependentLocality": CNPostalAddressSubLocalityKey,
            @"postalCode": CNPostalAddressPostalCodeKey,
            @"region": CNPostalAddressStateKey,
            @"subAdministrativeArea": CNPostalAddressSubAdministrativeAreaKey
        };
    });

    return [addressField isKindOfClass:[NSString class]] ? postalAddressKeys[(NSString *)addressField] : nil;
}

// https://developer.apple.com/documentation/passkit/pkcontactfield?language=objc
- (PKContactField _Nullable)contactFieldFromPayerField:(id _Nullable)payerField
{
    static NSDictionary<NSString *, PKContactField> *payerContactFields;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        payerContactFields = @{
            @"email": PKContactFieldEmailAddress,
            @"name": PKContactFieldName,
            @"phone": PKContactFieldPhoneNumber,
            @"postalAddress": PKContactFieldPostalAddress
        };
    });

    return [payerField isKindOfClass:[NSString class]] ? payerContactFields[(NSString *)payerField] : nil;
}

- (NSDictionary *_Nonnull)getAddressFromPostalAddress:(CNPostalAddress *_Nullable)postalAddress
{
    return @{
        @"address1": postalAddress.street ?: @"",
        @"address2": postalAddress.city ?: @"",
        @"address3": postalAddress.state ?: @"",
        @"administrativeArea": postalAddress.subAdministrativeArea ?: @"",
        @"countryCode": postalAddress.ISOCountryCode ?: @"",
        @"locality": postalAddress.subLocality ?: @"",
        @"postalCode": postalAddress.postalCode ?: @"",
        @"sortingCode": @""
    };
}

- (NSDictionary *_Nonnull)getMethodDetailsFromPaymentMethod:(PKPaymentMethod *_Nullable)paymentMethod
{
    return @{
        @"displayName": paymentMethod.displayName ?: @"",
        @"network": paymentMethod.network ?: @"",
        @"type": [self stringFromPaymentMethodType:paymentMethod.type]
    };
}

- (NSArray<PKShippingMethod *> *_Nonnull)getShippingMethodsFromShippingOptions:(NSArray *_Nullable)shippingOptions
{
    NSMutableArray<PKShippingMethod *> *shippingMethods = [NSMutableArray array];

    if (![shippingOptions isKindOfClass:[NSArray class]]) {
        return shippingMethods;
    }

    for (id shippingOption in shippingOptions) {
        PKShippingMethod *shippingMethod = [self convertShippingOptionToShippingMethod:shippingOption];

        if (shippingMethod != nil) {
            [shippingMethods addObject:shippingMethod];
        }
    }

    return shippingMethods;
}

// https://developer.apple.com/documentation/passkit/pkshippingmethod?language=objc
- (PKShippingMethod *_Nullable)convertShippingOptionToShippingMethod:(id _Nullable)shippingOption
{
    if (![shippingOption isKindOfClass:[NSDictionary class]]) {
        RCTLogWarn(@"Payments: skipping a shipping option that is not an object");
        return nil;
    }

    NSDictionary *option = (NSDictionary *)shippingOption;
    NSDecimalNumber *amount = [self getDecimalNumberFromAmount:option[@"amount"]];
    id label = option[@"label"];
    id identifier = option[@"id"];

    if (amount == nil || ![label isKindOfClass:[NSString class]] || ![identifier isKindOfClass:[NSString class]]) {
        RCTLogWarn(@"Payments: skipping a shipping option without a string id, a string label and a string amount value");
        return nil;
    }

    PKShippingMethod *shippingMethod = [PKShippingMethod summaryItemWithLabel:(NSString *)label amount:amount];
    shippingMethod.identifier = (NSString *)identifier;

    id detail = option[@"detail"];
    if ([detail isKindOfClass:[NSString class]]) {
        shippingMethod.detail = (NSString *)detail;
    }

    return shippingMethod;
}

- (NSDecimalNumber *_Nullable)getDecimalNumberFromAmount:(id _Nullable)amount
{
    if (![amount isKindOfClass:[NSDictionary class]]) {
        return nil;
    }

    id value = ((NSDictionary *)amount)[@"value"];

    if (![value isKindOfClass:[NSString class]]) {
        return nil;
    }

    NSDecimalNumber *decimalNumber = [NSDecimalNumber decimalNumberWithString:(NSString *)value];

    return [decimalNumber isEqualToNumber:[NSDecimalNumber notANumber]] ? nil : decimalNumber;
}

- (PKPaymentSummaryItem *_Nonnull)convertDisplayItemToPaymentSummaryItem:(NSDictionary *_Nonnull)displayItem;
{
    NSDecimalNumber *decimalNumberAmount = [NSDecimalNumber decimalNumberWithString:displayItem[@"amount"][@"value"]];
    PKPaymentSummaryItem *paymentSummaryItem = [PKPaymentSummaryItem summaryItemWithLabel:displayItem[@"label"] amount:decimalNumberAmount];

    return paymentSummaryItem;
}

// https://developer.apple.com/documentation/passkit/pkpaymentrequest/1619231-paymentsummaryitems?language=objc
- (NSArray<PKPaymentSummaryItem *> *_Nonnull)getPaymentSummaryItemsFromDetails:(NSDictionary *_Nonnull)details
{
    NSMutableArray <PKPaymentSummaryItem *> *paymentSummaryItems = [NSMutableArray array];

    NSArray *displayItems = details[@"displayItems"];
    if (displayItems.count > 0) {
        for (NSDictionary *displayItem in displayItems) {
            [paymentSummaryItems addObject: [self convertDisplayItemToPaymentSummaryItem:displayItem]];
        }
    }

    NSDictionary *total = details[@"total"];
    [paymentSummaryItems addObject: [self convertDisplayItemToPaymentSummaryItem:total]];

    return paymentSummaryItems;
}

- (PKPaymentNetwork)paymentNetworkFromString:(NSString *)paymentNetworkString {
    static NSDictionary<NSString *, PKPaymentNetwork> *paymentNetworks;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        paymentNetworks = @{
            @"PKPaymentNetworkAmex": PKPaymentNetworkAmex,
            @"PKPaymentNetworkDiscover": PKPaymentNetworkDiscover,
            @"PKPaymentNetworkMasterCard": PKPaymentNetworkMasterCard,
            @"PKPaymentNetworkVisa": PKPaymentNetworkVisa,
            @"PKPaymentNetworkChinaUnionPay": PKPaymentNetworkChinaUnionPay,
            @"PKPaymentNetworkInterac": PKPaymentNetworkInterac,
            @"PKPaymentNetworkPrivateLabel": PKPaymentNetworkPrivateLabel,
            @"PKPaymentNetworkSuica": PKPaymentNetworkSuica,
            @"PKPaymentNetworkIDCredit": PKPaymentNetworkIDCredit,
            @"PKPaymentNetworkQuicPay": PKPaymentNetworkQuicPay,
            @"PKPaymentNetworkJCB": PKPaymentNetworkJCB,
            @"PKPaymentNetworkMaestro": PKPaymentNetworkMaestro,
            @"PKPaymentNetworkEftpos": PKPaymentNetworkEftpos,
            @"PKPaymentNetworkCartesBancaires": PKPaymentNetworkCartesBancaires,
            @"PKPaymentNetworkVPay": PKPaymentNetworkVPay,
            @"PKPaymentNetworkMada": PKPaymentNetworkMada,
            @"PKPaymentNetworkElectron": PKPaymentNetworkElectron,
            @"PKPaymentNetworkElo": PKPaymentNetworkElo
        };

        if (@available(iOS 16.0, *)) {
            NSMutableDictionary *mutablePaymentNetworks = [paymentNetworks mutableCopy];
            // Dynamically get PKPaymentNetworkBancontact to avoid linking issues
            Class pkPaymentNetworkClass = NSClassFromString(@"PKPaymentNetwork");
            if (pkPaymentNetworkClass) {
                id bancontactNetwork = [pkPaymentNetworkClass performSelector:@selector(Bancontact)];
                if (bancontactNetwork) {
                    mutablePaymentNetworks[@"PKPaymentNetworkBancontact"] = bancontactNetwork;
                }
            }
            paymentNetworks = [mutablePaymentNetworks copy];
        }

        if (@available(iOS 15.1, *)) {
            NSMutableDictionary *mutablePaymentNetworks = [paymentNetworks mutableCopy];
            // Dynamically get PKPaymentNetworkDankort to avoid linking issues on iOS 15.1
            Class pkPaymentNetworkClass = NSClassFromString(@"PKPaymentNetwork");
            if (pkPaymentNetworkClass) {
                id dankortNetwork = [pkPaymentNetworkClass performSelector:@selector(Dankort)];
                if (dankortNetwork) {
                    mutablePaymentNetworks[@"PKPaymentNetworkDankort"] = dankortNetwork;
                }
            }
            paymentNetworks = [mutablePaymentNetworks copy];
        }

        if (@available(iOS 14.5, *)) {
            NSMutableDictionary *mutablePaymentNetworks = [paymentNetworks mutableCopy];
            // HINT: You should never work
            // Dynamically get PKPaymentNetworkMir to avoid linking issues
            Class pkPaymentNetworkClass = NSClassFromString(@"PKPaymentNetwork");
            if (pkPaymentNetworkClass) {
                id mirNetwork = [pkPaymentNetworkClass performSelector:@selector(Mir)];
                if (mirNetwork) {
                    mutablePaymentNetworks[@"PKPaymentNetworkMIR"] = mirNetwork;
                }
            }
            paymentNetworks = [mutablePaymentNetworks copy];
        }

        if (@available(iOS 14.0, *)) {
            NSMutableDictionary *mutablePaymentNetworks = [paymentNetworks mutableCopy];
            mutablePaymentNetworks[@"PKPaymentNetworkGirocard"] = PKPaymentNetworkGirocard;
            mutablePaymentNetworks[@"PKPaymentNetworkBarcode"] = PKPaymentNetworkBarcode;
            paymentNetworks = [mutablePaymentNetworks copy];
        }

        if (@available(iOS 12.0, *)) {
            NSMutableDictionary *mutablePaymentNetworks = [paymentNetworks mutableCopy];
            mutablePaymentNetworks[@"PKPaymentNetworkCartesBancaires"] = PKPaymentNetworkCartesBancaires;
            mutablePaymentNetworks[@"PKPaymentNetworkVPay"] = PKPaymentNetworkVPay;
            mutablePaymentNetworks[@"PKPaymentNetworkEftpos"] = PKPaymentNetworkEftpos;
            mutablePaymentNetworks[@"PKPaymentNetworkMaestro"] = PKPaymentNetworkMaestro;
            paymentNetworks = [mutablePaymentNetworks copy];
        }
    });

    return paymentNetworks[paymentNetworkString] ?: PKPaymentNetworkUnknown;
}

- (PKMerchantCapability)merchantCapabilityFromString:(NSString *)capabilityString {
    NSDictionary *capabilityMap = @{
        @"PKMerchantCapability3DS": @(PKMerchantCapability3DS),
        @"PKMerchantCapabilityEMV": @(PKMerchantCapabilityEMV),
        @"PKMerchantCapabilityCredit": @(PKMerchantCapabilityCredit),
        @"PKMerchantCapabilityDebit": @(PKMerchantCapabilityDebit)
    };

    NSNumber *mappedCapabilityNumber = capabilityMap[capabilityString];
    if (mappedCapabilityNumber != nil) {
        return (PKMerchantCapability)mappedCapabilityNumber.unsignedLongValue;
    } else {
        return PKMerchantCapabilityUnknown;
    }
}

- (PKContactField)contactFieldFromString:(NSString *)inputString {
    NSDictionary<NSString *, PKContactField> *contactFieldMapping = @{
        @"PKContactFieldName": PKContactFieldName,
        @"PKContactFieldPostalAddress": PKContactFieldPostalAddress,
        @"PKContactFieldEmailAddress": PKContactFieldEmailAddress,
        @"PKContactFieldPhoneNumber": PKContactFieldPhoneNumber,
    };

    PKContactField field = contactFieldMapping[inputString];

    return field;
}

- (NSString *)stringFromPaymentMethodType:(PKPaymentMethodType)type {
    switch (type) {
        case PKPaymentMethodTypeUnknown:
            return @"PKPaymentMethodTypeUnknown";
        case PKPaymentMethodTypeDebit:
            return @"PKPaymentMethodTypeDebit";
        case PKPaymentMethodTypeCredit:
            return @"PKPaymentMethodTypeCredit";
        case PKPaymentMethodTypePrepaid:
            return @"PKPaymentMethodTypePrepaid";
        case PKPaymentMethodTypeStore:
            return @"PKPaymentMethodTypeStore";
        default:
            return @"PKPaymentMethodTypeUnknown";
    }
}

- (void)rejectPromise:(NSString *)errorCode message:(NSString *)message  error:(NSError *)error {
    if (self.paymentReject) {
        self.paymentReject(errorCode, message, error);
    }

    self.paymentReject = nil;
    self.paymentResolve = nil;
}


// Don't compile this code when we build for the old architecture.
#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativePaymentsSpecJSI>(params);
}
#endif

@end
