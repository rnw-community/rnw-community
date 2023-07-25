#import "Payments.h"

#import <objc/runtime.h>
#import <React/RCTLog.h>

// TODO: Add logs
@implementation Payments

RCT_EXPORT_MODULE()

static const PKMerchantCapability PKMerchantCapabilityUnknown = 9999;
static const PKPaymentNetwork PKPaymentNetworkUnknown = 0;

// https://reactnative.dev/docs/native-modules-ios#threading
- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}

RCT_EXPORT_METHOD(show:(NSString *)methodDataString
                        details:(NSDictionary *)details
                        resolve:(RCTPromiseResolveBlock)resolve
                        reject:(RCTPromiseRejectBlock)reject)
{
    self.paymentResolve = resolve;
    self.paymentReject = reject;

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

    // https://developer.apple.com/documentation/passkit/pkpaymentrequest/1619231-paymentsummaryitems?language=objc
    paymentRequest.paymentSummaryItems = [self getPaymentSummaryItemsFromDetails:details];

    // HINT: ShippingOptions is not a part of the W3C Spec anymore
    // https://developer.mozilla.org/en-US/docs/Web/API/PaymentRequest/shippingOption
    // https://developer.mozilla.org/en-US/docs/Web/API/PaymentRequest/shippingAddress

    // https://developer.apple.com/documentation/passkit/pkpaymentrequest/2865928-requiredbillingcontactfields?language=objc
    if(methodData[@"requiredBillingContactFields"]) {
        paymentRequest.requiredBillingContactFields = [NSSet setWithArray:@[PKContactFieldName, PKContactFieldEmailAddress, PKContactFieldPostalAddress, PKContactFieldPhoneNumber]];
    }

    // https://developer.apple.com/documentation/passkit/pkpaymentrequest/2865927-requiredshippingcontactfields?language=objc
    if(methodData[@"requiredShippingContactFields"]) {
        paymentRequest.requiredShippingContactFields = [NSSet setWithArray:@[PKContactFieldPostalAddress, PKContactFieldName, PKContactFieldEmailAddress, PKContactFieldPhoneNumber]];
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
    [controller dismissViewControllerAnimated:YES completion:^{
        [self rejectPromise:@"payment_error" message:@"Payment process canceled by user." error:nil];
    }];
}

// https://developer.apple.com/documentation/passkit/pkpaymentauthorizationviewcontrollerdelegate/2865759-paymentauthorizationviewcontroll?language=objc
- (void) paymentAuthorizationViewController:(PKPaymentAuthorizationViewController *)controller
                        didAuthorizePayment:(PKPayment *)payment
                                    handler:(void (^)(PKPaymentAuthorizationResult *result))completion
{
    self.completion = completion;

    NSDictionary *paymentDict = [self objectToDictionary:payment ignoredKeys:@[@"billingAddress", @"shippingAddress"]];

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

- (PKPaymentNetwork)paymentNetworkFromString:(NSString *)paymentNetworkString {
    if ([paymentNetworkString isEqualToString:@"PKPaymentNetworkAmex"]) {
        return PKPaymentNetworkAmex;
    } else if ([paymentNetworkString isEqualToString:@"PKPaymentNetworkDiscover"]) {
        return PKPaymentNetworkDiscover;
    } else if ([paymentNetworkString isEqualToString:@"PKPaymentNetworkMasterCard"]) {
        return PKPaymentNetworkMasterCard;
    } else if ([paymentNetworkString isEqualToString:@"PKPaymentNetworkVisa"]) {
        return PKPaymentNetworkVisa;
    } else if ([paymentNetworkString isEqualToString:@"PKPaymentNetworkChinaUnionPay"]) {
        return PKPaymentNetworkChinaUnionPay;
    } else if ([paymentNetworkString isEqualToString:@"PKPaymentNetworkInterac"]) {
        return PKPaymentNetworkInterac;
    } else if ([paymentNetworkString isEqualToString:@"PKPaymentNetworkPrivateLabel"]) {
        return PKPaymentNetworkPrivateLabel;
    } else if ([paymentNetworkString isEqualToString:@"PKPaymentNetworkSuica"]) {
        return PKPaymentNetworkSuica;
    } else if ([paymentNetworkString isEqualToString:@"PKPaymentNetworkIDCredit"]) {
        return PKPaymentNetworkIDCredit;
    } else if ([paymentNetworkString isEqualToString:@"PKPaymentNetworkQuicPay"]) {
        return PKPaymentNetworkQuicPay;
    } else if ([paymentNetworkString isEqualToString:@"PKPaymentNetworkJCB"]) {
        return PKPaymentNetworkJCB;
    } else if (@available(iOS 12.0, *)) {
        if ([paymentNetworkString isEqualToString:@"PKPaymentNetworkCartesBancaires"]) {
            return PKPaymentNetworkCartesBancaires;
        } else if ([paymentNetworkString isEqualToString:@"PKPaymentNetworkVPay"]) {
            return PKPaymentNetworkVPay;
        } else if ([paymentNetworkString isEqualToString:@"PKPaymentNetworkEftpos"]) {
            return PKPaymentNetworkEftpos;
        } else if ([paymentNetworkString isEqualToString:@"PKPaymentNetworkMaestro"]) {
            return PKPaymentNetworkMaestro;
        }
    }

    return PKPaymentNetworkUnknown;
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
