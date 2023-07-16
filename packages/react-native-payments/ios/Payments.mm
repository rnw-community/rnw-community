#import "Payments.h"

// TODO: Rewrite according to recent docs https://developer.apple.com/documentation/passkit/apple_pay/offering_apple_pay_in_your_app?language=objc
@implementation Payments

RCT_EXPORT_MODULE()

// https://reactnative.dev/docs/native-modules-ios#threading
- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}

// TODO: Do we need it?
+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

RCT_EXPORT_METHOD(show:(NSDictionary *)methodData
                        details:(NSDictionary *)details
                        resolve:(RCTPromiseResolveBlock)resolve
                        reject:(RCTPromiseRejectBlock)reject)
{
    NSString *merchantId = methodData[@"merchantIdentifier"];
    NSString *countryCode = methodData[@"countryCode"];
    NSString *currencyCode = methodData[@"currencyCode"];

    if (!merchantId) {
        reject(@"no_merchant_id", @"No merchant identifier provided", nil);
        return;
    }

    if(!countryCode) {
        reject(@"no_country_code", @"No country code provided", nil);
        return;
    }

    if(!currencyCode) {
        reject(@"no_currency_code", @"No currency code provided", nil);
        return;
    }

    PKPaymentRequest *paymentRequest = [[PKPaymentRequest alloc] init];

    // https://developer.apple.com/documentation/passkit/pkpaymentrequest/1619257-merchantcapabilities?language=objc
    // TODO: Should we add other capabilities or make it configurable? https://developer.apple.com/documentation/passkit/pkmerchantcapability?language=objc
    paymentRequest.merchantCapabilities = PKMerchantCapability3DS;

    // https://developer.apple.com/documentation/passkit/pkpaymentrequest/1619305-merchantidentifier?language=objc
    paymentRequest.merchantIdentifier = merchantId;

    // TODO: Should we add supportedCountries config if matched by the android config?
    // https://developer.apple.com/documentation/passkit/pkpaymentrequest/2865929-supportedcountries?language=objc

    // https://developer.apple.com/documentation/passkit/pkpaymentrequest/1619246-countrycode?language=objc
    paymentRequest.countryCode = countryCode;
    // https://developer.apple.com/documentation/passkit/pkpaymentrequest/1619248-currencycode?language=objc
    paymentRequest.currencyCode = currencyCode;

    // https://developer.apple.com/documentation/passkit/pkpaymentrequest/1833288-availablenetworks?language=objc
    // https://developer.apple.com/documentation/passkit/pkpaymentrequest/1619329-supportednetworks?language=objc
    paymentRequest.supportedNetworks = self.supportedNetworks;

    // https://developer.apple.com/documentation/passkit/pkpaymentrequest/1619231-paymentsummaryitems?language=objc
    paymentRequest.paymentSummaryItems = [self getPaymentSummaryItemsFromDetails:details];

    // https://developer.apple.com/documentation/passkit/pkpaymentrequest/2865928-requiredbillingcontactfields?language=objc
    // https://developer.apple.com/documentation/passkit/pkpaymentrequest/2865927-requiredshippingcontactfields?language=objc
    paymentRequest.shippingMethods = [self getShippingMethodsFromDetails:details];

    self.viewController = [[PKPaymentAuthorizationViewController alloc] initWithPaymentRequest: paymentRequest];
    self.viewController.delegate = self;

    // https://reactnative.dev/docs/native-modules-ios#threading
    dispatch_async(dispatch_get_main_queue(), ^{
        UIViewController *rootViewController = RCTPresentedViewController();

        [rootViewController presentViewController:self.viewController animated:YES completion:nil];

        resolve(nil);
    });
}

RCT_EXPORT_METHOD(abort: (RCTPromiseResolveBlock)resolve
                          reject:(RCTPromiseRejectBlock)reject)
{
    [self.viewController dismissViewControllerAnimated:YES completion:nil];

    resolve(nil);
}

RCT_EXPORT_METHOD(complete: (NSString *)paymentStatus
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    if ([paymentStatus isEqualToString: @"success"]) {
        self.completion(PKPaymentAuthorizationStatusSuccess);
    } else {
        self.completion(PKPaymentAuthorizationStatusFailure);
    }

    resolve(nil);
}

RCT_EXPORT_METHOD(canMakePayments: (NSDictionary *)methodData
                                   resolve:(RCTPromiseResolveBlock)resolve
                                   reject:(RCTPromiseRejectBlock)reject)
{
    resolve(@([PKPaymentAuthorizationViewController canMakePayments]));
}

// DELEGATES https://developer.apple.com/documentation/passkit/pkpaymentauthorizationviewcontrollerdelegate?language=objc

// https://developer.apple.com/documentation/passkit/pkpaymentauthorizationviewcontrollerdelegate/1616180-paymentauthorizationviewcontroll?language=objc
- (void) paymentAuthorizationViewControllerDidFinish:(PKPaymentAuthorizationViewController *)controller
{
    [controller dismissViewControllerAnimated:YES completion:nil];

    [self sendEventWithName:@"Payments:dismiss" body:nil];
}

// TODO: Fix deprecated delegate usage
// https://developer.apple.com/documentation/passkit/pkpaymentauthorizationviewcontrollerdelegate/2865759-paymentauthorizationviewcontroll?language=objc
- (void) paymentAuthorizationViewController:(PKPaymentAuthorizationViewController *)controller
                        didAuthorizePayment:(PKPayment *)payment
                                 completion:(void (^)(PKPaymentAuthorizationStatus))completion
{
    self.completion = completion;

    [self handleUserAccept:payment paymentToken:nil];
}

// PRIVATE METHODS

- (PKPaymentSummaryItem *_Nonnull)convertDisplayItemToPaymentSummaryItem:(NSDictionary *_Nonnull)displayItem;
{
    NSDecimalNumber *decimalNumberAmount = [NSDecimalNumber decimalNumberWithString:displayItem[@"amount"][@"value"]];
    PKPaymentSummaryItem *paymentSummaryItem = [PKPaymentSummaryItem summaryItemWithLabel:displayItem[@"label"] amount:decimalNumberAmount];

    return paymentSummaryItem;
}

- (NSArray<PKPaymentSummaryItem *> *_Nonnull)getPaymentSummaryItemsFromDetails:(NSDictionary *_Nonnull)details
{
    // Setup `paymentSummaryItems` array
    NSMutableArray <PKPaymentSummaryItem *> * paymentSummaryItems = [NSMutableArray array];

    // Add `displayItems` to `paymentSummaryItems`
    NSArray *displayItems = details[@"displayItems"];
    if (displayItems.count > 0) {
        for (NSDictionary *displayItem in displayItems) {
            [paymentSummaryItems addObject: [self convertDisplayItemToPaymentSummaryItem:displayItem]];
        }
    }

    // Add total to `paymentSummaryItems`
    NSDictionary *total = details[@"total"];
    [paymentSummaryItems addObject: [self convertDisplayItemToPaymentSummaryItem:total]];

    return paymentSummaryItems;
}

- (PKShippingMethod *_Nonnull)convertShippingOptionToShippingMethod:(NSDictionary *_Nonnull)shippingOption
{
    PKShippingMethod *shippingMethod = [PKShippingMethod summaryItemWithLabel:shippingOption[@"label"] amount:[NSDecimalNumber decimalNumberWithString: shippingOption[@"amount"][@"value"]]];
    shippingMethod.identifier = shippingOption[@"id"];

    // shippingOption.detail is not part of the PaymentRequest spec.
    if ([shippingOption[@"detail"] isKindOfClass:[NSString class]]) {
        shippingMethod.detail = shippingOption[@"detail"];
    } else {
        shippingMethod.detail = @"";
    }

    return shippingMethod;
}

- (NSArray<PKShippingMethod *> *_Nonnull)getShippingMethodsFromDetails:(NSDictionary *_Nonnull)details
{
    // Setup `shippingMethods` array
    NSMutableArray <PKShippingMethod *> * shippingMethods = [NSMutableArray array];

    // Add `shippingOptions` to `shippingMethods`
    NSArray *shippingOptions = details[@"shippingOptions"];
    if (shippingOptions.count > 0) {
        for (NSDictionary *shippingOption in shippingOptions) {
            [shippingMethods addObject: [self convertShippingOptionToShippingMethod:shippingOption]];
        }
    }

    return shippingMethods;
}

- (NSString *_Nonnull)contactToString:(PKContact *_Nonnull)contact
{
    NSString *namePrefix = contact.name.namePrefix;
    NSString *givenName = contact.name.givenName;
    NSString *middleName = contact.name.middleName;
    NSString *familyName = contact.name.familyName;
    NSString *nameSuffix = contact.name.nameSuffix;
    NSString *nickname = contact.name.nickname;
    NSString *street = contact.postalAddress.street;
    NSString *subLocality = contact.postalAddress.subLocality;
    NSString *city = contact.postalAddress.city;
    NSString *subAdministrativeArea = contact.postalAddress.subAdministrativeArea;
    NSString *state = contact.postalAddress.state;
    NSString *postalCode = contact.postalAddress.postalCode;
    NSString *country = contact.postalAddress.country;
    NSString *ISOCountryCode = contact.postalAddress.ISOCountryCode;
    NSString *phoneNumber = contact.phoneNumber.stringValue;
    NSString *emailAddress = contact.emailAddress;

    NSDictionary *contactDict = @{
         @"name" : @{
                 @"namePrefix" : namePrefix ?: @"",
                 @"givenName" : givenName ?: @"",
                 @"middleName" : middleName ?: @"",
                 @"familyName" : familyName ?: @"",
                 @"nameSuffix" : nameSuffix ?: @"",
                 @"nickname" : nickname ?: @"",
         },
         @"postalAddress" : @{
                 @"street" : street ?: @"",
                 @"subLocality" : subLocality ?: @"",
                 @"city" : city ?: @"",
                 @"subAdministrativeArea" : subAdministrativeArea ?: @"",
                 @"state" : state ?: @"",
                 @"postalCode" : postalCode ?: @"",
                 @"country" : country ?: @"",
                 @"ISOCountryCode" : ISOCountryCode ?: @""
         },
         @"phoneNumber" : phoneNumber ?: @"",
         @"emailAddress" : emailAddress ?: @""
    };

    NSError *error;
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:contactDict options:0 error:&error];

    if (! jsonData) {
       return @"";
    } else {
       return [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
    }

}

- (NSDictionary *_Nonnull)paymentMethodToString:(PKPaymentMethod *_Nonnull)paymentMethod
{
    NSMutableDictionary *result = [[NSMutableDictionary alloc]initWithCapacity:4];

    if(paymentMethod.displayName) {
        [result setObject:paymentMethod.displayName forKey:@"displayName"];
    }
    if (paymentMethod.network) {
        [result setObject:paymentMethod.network forKey:@"network"];
    }
    NSString *type = [self paymentMethodTypeToString:paymentMethod.type];
    [result setObject:type forKey:@"type"];
    if(paymentMethod.paymentPass) {
        NSDictionary *paymentPass = [self paymentPassToDictionary:paymentMethod.paymentPass];
        [result setObject:paymentPass forKey:@"paymentPass"];
    }

    return result;
}

- (NSString *_Nonnull)paymentMethodTypeToString:(PKPaymentMethodType)paymentMethodType
{
    NSArray *arr = @[@"PKPaymentMethodTypeUnknown",
                     @"PKPaymentMethodTypeDebit",
                     @"PKPaymentMethodTypeCredit",
                     @"PKPaymentMethodTypePrepaid",
                     @"PKPaymentMethodTypeStore"];
    return (NSString *)[arr objectAtIndex:paymentMethodType];
}

- (NSDictionary *_Nonnull)paymentPassToDictionary:(PKPaymentPass *_Nonnull)paymentPass
{
    return @{
        @"primaryAccountIdentifier" : paymentPass.primaryAccountIdentifier,
        @"primaryAccountNumberSuffix" : paymentPass.primaryAccountNumberSuffix,
        @"deviceAccountIdentifier" : paymentPass.deviceAccountIdentifier,
        @"deviceAccountNumberSuffix" : paymentPass.deviceAccountNumberSuffix,
        @"activationState" : [self paymentPassActivationStateToString:paymentPass.activationState]
    };
}

- (NSString *_Nonnull)paymentPassActivationStateToString:(PKPaymentPassActivationState)paymentPassActivationState
{
    NSArray *arr = @[@"PKPaymentPassActivationStateActivated",
                     @"PKPaymentPassActivationStateRequiresActivation",
                     @"PKPaymentPassActivationStateActivating",
                     @"PKPaymentPassActivationStateSuspended",
                     @"PKPaymentPassActivationStateDeactivated"];
    return (NSString *)[arr objectAtIndex:paymentPassActivationState];
}

- (void)handleUserAccept:(PKPayment *_Nonnull)payment paymentToken:(NSString *_Nullable)token
{
    NSMutableDictionary *paymentResponse = [[NSMutableDictionary alloc]initWithCapacity:6];

    NSString *transactionId = payment.token.transactionIdentifier;
    [paymentResponse setObject:transactionId forKey:@"transactionIdentifier"];

    NSString *paymentData = [[NSString alloc] initWithData:payment.token.paymentData encoding:NSUTF8StringEncoding];
    [paymentResponse setObject:paymentData forKey:@"paymentData"];

    NSDictionary *paymentMethod = [self paymentMethodToString:payment.token.paymentMethod];
    [paymentResponse setObject:paymentMethod forKey:@"paymentMethod"];

    if (token) {
        [paymentResponse setObject:token forKey:@"paymentToken"];
    }

    if (payment.billingContact) {
        paymentResponse[@"billingContact"] = [self contactToString:payment.billingContact];
    }

    if (payment.shippingContact) {
        paymentResponse[@"shippingContact"] = [self contactToString:payment.shippingContact];
    }

    [self sendEventWithName:@"Payments:accept" body:paymentResponse];
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
