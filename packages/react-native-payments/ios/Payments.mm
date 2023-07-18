#import "Payments.h"
#import <objc/runtime.h>

// TODO: Rewrite according to recent docs https://developer.apple.com/documentation/passkit/apple_pay/offering_apple_pay_in_your_app?language=objc
@implementation Payments

RCT_EXPORT_MODULE()

// https://reactnative.dev/docs/native-modules-ios#threading
- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}

// https://reactnative.dev/docs/native-modules-ios#sending-events-to-javascript
- (NSArray<NSString *> *)supportedEvents;
{
    return @[@"ReactNativePayments:accept", @"ReactNativePayments:dismiss"];
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

    // TODO: Should we add supportedCountries config, if android has the same?
    // https://developer.apple.com/documentation/passkit/pkpaymentrequest/2865929-supportedcountries?language=objc
    if(!countryCode) {
        reject(@"no_country_code", @"No country code provided", nil);
        return;
    }

    if(!currencyCode) {
        reject(@"no_currency_code", @"No currency code provided", nil);
        return;
    }

    // HINT: Validating supportedNetworks
    // This should match SupportedNetworkEnum from the TS
    // https://developer.apple.com/documentation/passkit/pkpaymentnetwork?language=objc
    // TODO: Should we add other PaymentNetworks? Lets wait for PRs =)
    NSDictionary *availableNetworks = @{
        @"visa" : PKPaymentNetworkVisa,
        @"mastercard" : PKPaymentNetworkMasterCard,
        @"amex" : PKPaymentNetworkAmex
    };
    NSMutableArray *supportedNetworks =  [NSMutableArray array];

    for (NSString *supportedNetwork in methodData[@"supportedNetworks"]) {
        PKPaymentNetwork foundNetwork = [availableNetworks objectForKey:supportedNetwork];
        if (foundNetwork == nil) {
            reject(@"invalid_supported_network", [NSString stringWithFormat:@"Invalid supportedNetwork passed '%@'", supportedNetwork], nil);
            return;
        }

        [supportedNetworks addObject:foundNetwork];
    }

    PKPaymentRequest *paymentRequest = [[PKPaymentRequest alloc] init];

    // https://developer.apple.com/documentation/passkit/pkpaymentrequest/1619257-merchantcapabilities?language=objc
    // TODO: Should we add other capabilities or make it configurable? https://developer.apple.com/documentation/passkit/pkmerchantcapability?language=objc
    paymentRequest.merchantCapabilities = PKMerchantCapability3DS;

    // https://developer.apple.com/documentation/passkit/pkpaymentrequest/1619305-merchantidentifier?language=objc
    paymentRequest.merchantIdentifier = merchantId;

    // https://developer.apple.com/documentation/passkit/pkpaymentrequest/1619246-countrycode?language=objc
    paymentRequest.countryCode = countryCode;
    // https://developer.apple.com/documentation/passkit/pkpaymentrequest/1619248-currencycode?language=objc
    paymentRequest.currencyCode = currencyCode;

    // https://developer.apple.com/documentation/passkit/pkpaymentrequest/1833288-availablenetworks?language=objc
    // https://developer.apple.com/documentation/passkit/pkpaymentrequest/1619329-supportednetworks?language=objc
    paymentRequest.supportedNetworks = supportedNetworks;

    // https://developer.apple.com/documentation/passkit/pkpaymentrequest/1619231-paymentsummaryitems?language=objc
    paymentRequest.paymentSummaryItems = [self getPaymentSummaryItemsFromDetails:details];

    // HINT: ShippingOptions is not a part of the W3C Spec anymore
    // https://developer.mozilla.org/en-US/docs/Web/API/PaymentRequest/shippingOption
    // https://developer.mozilla.org/en-US/docs/Web/API/PaymentRequest/shippingAddress

    // Though it is still available in the ApplePay:
    // https://developer.apple.com/documentation/passkit/pkpaymentrequest/2865928-requiredbillingcontactfields?language=objc
    // paymentRequest.requiredBillingContactFields = [NSSet setWithArray:@[PKContactFieldPostalAddress, PKContactFieldName]];

    // https://developer.apple.com/documentation/passkit/pkpaymentrequest/2865927-requiredshippingcontactfields?language=objc
    // paymentRequest.requiredShippingContactFields = [NSSet setWithArray:@[PKContactFieldPostalAddress, PKContactFieldName, PKContactFieldEmailAddress, PKContactFieldPhoneNumber]];

    // https://developer.apple.com/documentation/passkit/pkpaymentauthorizationviewcontroller/1616178-initwithpaymentrequest?language=objc
    self.viewController = [[PKPaymentAuthorizationViewController alloc] initWithPaymentRequest: paymentRequest];
    self.viewController.delegate = self;

    if (!self.viewController) {
        reject(@"no_view_controller", @"Failed initializing PKPaymentAuthorizationViewController, check you app ApplePay capabilities and merchantIdentifier", nil);
        return;
    }

    UIViewController *rootViewController = RCTPresentedViewController();
    [rootViewController presentViewController:self.viewController animated:YES completion:^{
        resolve(nil);
    }];
}

RCT_EXPORT_METHOD(abort: (RCTPromiseResolveBlock)resolve
                          reject:(RCTPromiseRejectBlock)reject)
{
    [self.viewController dismissViewControllerAnimated:YES completion:^{
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

    self.completion([[PKPaymentAuthorizationResult alloc] initWithStatus:status errors:nil]);

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
    [controller dismissViewControllerAnimated:YES completion:^{
        [self sendEventWithName:@"ReactNativePayments:dismiss" body:nil];
    }];
}

// https://developer.apple.com/documentation/passkit/pkpaymentauthorizationviewcontrollerdelegate/2865759-paymentauthorizationviewcontroll?language=objc
- (void) paymentAuthorizationViewController:(PKPaymentAuthorizationViewController *)controller
                        didAuthorizePayment:(PKPayment *)payment
                                    handler:(void (^)(PKPaymentAuthorizationResult *result))completion
{
    self.completion = completion;

    [self sendEventWithName:@"ReactNativePayments:accept" body:[self objectToDictionary:payment ignoredKeys:@[@"billingAddress", @"shippingAddress"]]];
}

// PRIVATE METHODS

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

- (NSDictionary *)objectToDictionary:(NSObject *)object ignoredKeys:(NSArray<NSString *> *)ignoredKeys {
    NSMutableDictionary *dictionary = [NSMutableDictionary dictionary];

    // Get the class of the object
    Class objectClass = [object class];

    // Enumerate through the properties of the object using KVC
    unsigned int propertyCount;
    objc_property_t *properties = class_copyPropertyList(objectClass, &propertyCount);

    for (unsigned int i = 0; i < propertyCount; i++) {
        objc_property_t property = properties[i];

        // Get the property name
        const char *propertyName = property_getName(property);
        NSString *propertyNameString = [NSString stringWithUTF8String:propertyName];

        // Check if the property name is in the ignoredKeys array
        if ([ignoredKeys containsObject:propertyNameString]) {
            // Skip this property if it's in the ignoredKeys array
            continue;
        }

        // Get the property value using KVC
        id propertyValue = [object valueForKey:propertyNameString];

        // Check if the property value is an object
        if ([propertyValue isKindOfClass:[NSObject class]]) {
            // Recursively convert the nested object to a dictionary
            NSDictionary *nestedDictionary = [self objectToDictionary:propertyValue ignoredKeys:ignoredKeys];

            // Set the nested dictionary as the value for the property
            dictionary[propertyNameString] = nestedDictionary;
        } else {
            // Set the property value directly
            dictionary[propertyNameString] = propertyValue;
        }
    }

    free(properties);

    return [dictionary copy];
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
